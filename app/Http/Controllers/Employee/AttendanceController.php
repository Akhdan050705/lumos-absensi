<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Shift;
use App\Models\Location;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            abort(403, 'Anda belum terdaftar sebagai pegawai.');
        }

        $unitId = $user->employee->unit_id;
        
        $shifts = Shift::where('unit_id', $unitId)->get();
        
        $todayAttendance = Attendance::where('employee_id', $user->employee->id)
                                     ->where('date', date('Y-m-d'))
                                     ->first();

        $history = Attendance::where('employee_id', $user->employee->id)
                             ->with('shift')
                             ->orderBy('date', 'desc')
                             ->limit(10)
                             ->get();

        return Inertia::render('Attendance/Index', [
            'shifts' => $shifts,
            'todayAttendance' => $todayAttendance,
            'history' => $history
        ]);
    }

    public function camera(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            abort(403, 'Akses khusus pegawai.');
        }

        $shiftId = $request->query('shift_id');
        $type = $request->query('type');

        // Jika dipanggil tanpa parameter, berikan default shift aktif pertama & tipe check-in
        if (!$shiftId) {
            $defaultShift = Shift::where('unit_id', $user->employee->unit_id)->where('is_active', 1)->first()
                ?? Shift::where('unit_id', $user->employee->unit_id)->first();
            $shiftId = $defaultShift ? $defaultShift->id : 1;
        }

        if (!in_array($type, ['in', 'out'])) {
            // Cek apakah sudah clock in hari ini untuk menentukan tipe default
            $today = Attendance::where('employee_id', $user->employee->id)
                ->where('date', date('Y-m-d'))
                ->first();
            $type = ($today && $today->check_in && !$today->check_out) ? 'out' : 'in';
        }

        $location = Location::where('unit_id', $user->employee->unit_id)->first();

        return Inertia::render('Attendance/Camera', [
            'shift_id' => $shiftId,
            'type' => $type,
            'unit_location' => $location
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shift_id' => 'required|exists:work_shifts,id',
            'type' => 'required|in:in,out',
            'image' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'accuracy' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $employeeId = $user->employee->id;
        $unitId = $user->employee->unit_id;
        $today = date('Y-m-d');
        $now = Carbon::now();

        $location = Location::where('unit_id', $unitId)->first();
        if (!$location) {
            return back()->withErrors(['location' => 'Data lokasi unit belum diatur di sistem.']);
        }

        // Validasi Akurasi GPS (Accuracy Limit)
        $accuracy = $request->accuracy ? (float)$request->accuracy : 10.0;
        if ($location->accuracy_limit && $accuracy > $location->accuracy_limit) {
            return back()->withErrors([
                'location' => "Akurasi sinyal GPS perangkat Anda (" . round($accuracy) . "m) melebihi batas toleransi (" . $location->accuracy_limit . "m). Pastikan GPS aktif dengan akurasi tinggi dan coba beberapa detik lagi."
            ]);
        }

        // Validasi Geofencing Jarak
        $distance = $this->calculateDistance(
            $request->latitude, $request->longitude, 
            $location->latitude, $location->longitude
        );

        if ($distance > $location->radius) {
            return back()->withErrors([
                'location' => 'Anda berada di luar radius lokasi (' . round($distance) . ' meter dari batas radius ' . $location->radius . 'm).'
            ]);
        }

        // Validasi dan Simpan Gambar Base64 ke Private Disk
        $imageValidation = $this->saveBase64Image($request->image, $employeeId, $request->type);
        if (!$imageValidation['success']) {
            return back()->withErrors(['image' => $imageValidation['message']]);
        }
        $imagePath = $imageValidation['path'];

        $attendance = Attendance::firstOrNew([
            'employee_id' => $employeeId,
            'date' => $today,
        ]);

        $attendance->shift_id = $request->shift_id;
        
        $shift = Shift::find($request->shift_id);
        $shiftStartTime = Carbon::parse($today . ' ' . $shift->start_time);
        
        if ($request->type === 'in') {
            if ($attendance->check_in) {
                return back()->withErrors(['general' => 'Anda sudah melakukan clock in hari ini.']);
            }
            $attendance->check_in = $now;
            
            // Perhitungan keterlambatan dengan Carbon 3
            if ($now->greaterThan($shiftStartTime)) {
                $lateMinutes = (int) $shiftStartTime->diffInMinutes($now);
                $attendance->late_minutes = $lateMinutes;
                $attendance->status = 'late';

                // Toleransi 30 menit & Denda Berjenjang Rp 50.000 per 30 menit
                $penaltyBase = (float) (DB::table('system_settings')->where('setting_key', 'lumos_late_penalty_base')->value('setting_value') ?? 50000);
                if ($lateMinutes > 30) {
                    $attendance->penalty_amount = ceil(($lateMinutes - 30) / 30) * $penaltyBase;
                } else {
                    $attendance->penalty_amount = 0;
                }
            } else {
                $attendance->late_minutes = 0;
                $attendance->penalty_amount = 0;
                $attendance->status = 'on_time';
            }
            
        } else {
            if (!$attendance->exists || !$attendance->check_in) {
                return back()->withErrors(['general' => 'Anda belum melakukan clock in hari ini.']);
            }
            if ($attendance->check_out) {
                return back()->withErrors(['general' => 'Anda sudah melakukan clock out hari ini.']);
            }
            $attendance->check_out = $now;
        }

        $attendance->save();

        // Save Photo Record
        DB::table('attendance_photos')->insert([
            'attendance_record_id' => $attendance->id,
            'type' => $request->type,
            'photo_path' => $imagePath,
            'created_at' => $now
        ]);

        // Save Location Log with real accuracy
        DB::table('attendance_location_logs')->insert([
            'attendance_record_id' => $attendance->id,
            'type' => $request->type,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'accuracy' => round($accuracy),
            'server_distance' => round($distance),
            'created_at' => $now
        ]);

        return redirect('/attendance')->with('message', 'Absensi berhasil dicatat!');
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }

    private function saveBase64Image($base64Image, $employeeId, $type): array
    {
        // Validasi format data URI base64
        if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,(.*)$/s', $base64Image, $matches)) {
            return ['success' => false, 'message' => 'Format gambar tidak valid. Gunakan kamera untuk mengambil foto asli.'];
        }

        $image_base64 = base64_decode($matches[2]);
        if (!$image_base64) {
            return ['success' => false, 'message' => 'Gagal membaca data gambar.'];
        }

        // Cek ukuran gambar: maksimal 5MB, minimal 1KB
        $sizeBytes = strlen($image_base64);
        if ($sizeBytes > 5 * 1024 * 1024) {
            return ['success' => false, 'message' => 'Ukuran gambar melebihi batas maksimal 5MB.'];
        }
        if ($sizeBytes < 1000) {
            return ['success' => false, 'message' => 'Data gambar terlalu kecil atau tidak lengkap.'];
        }

        $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $fileName = 'attendance/' . date('Y-m-d') . '_' . $employeeId . '_' . $type . '_' . uniqid() . '.' . $ext;
        
        // Simpan ke private storage (disk local) sesuai aturan keamanan
        Storage::disk('local')->put($fileName, $image_base64);
        
        return ['success' => true, 'path' => $fileName];
    }
}

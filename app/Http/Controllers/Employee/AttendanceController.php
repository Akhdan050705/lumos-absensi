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
                             ->limit(5)
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
        $shiftId = $request->query('shift_id');
        $type = $request->query('type');

        if (!in_array($type, ['in', 'out']) || !$shiftId) {
            return redirect()->route('attendance.index')->with('error', 'Parameter tidak valid.');
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
        ]);

        $user = $request->user();
        $employeeId = $user->employee->id;
        $unitId = $user->employee->unit_id;
        $today = date('Y-m-d');
        $now = Carbon::now();

        $location = Location::where('unit_id', $unitId)->first();
        if (!$location) {
            return back()->withErrors(['location' => 'Data lokasi unit belum diatur.']);
        }

        $distance = $this->calculateDistance(
            $request->latitude, $request->longitude, 
            $location->latitude, $location->longitude
        );

        if ($distance > $location->radius) {
            return back()->withErrors(['location' => 'Anda berada di luar radius absensi (' . round($distance) . ' meter dari batas ' . $location->radius . 'm).']);
        }

        $imagePath = $this->saveBase64Image($request->image, $employeeId, $request->type);

        $attendance = Attendance::firstOrNew([
            'employee_id' => $employeeId,
            'date' => $today,
        ]);

        $attendance->shift_id = $request->shift_id;
        
        $shift = Shift::find($request->shift_id);
        $shiftStartTime = Carbon::parse($today . ' ' . $shift->start_time);
        
        $lateDiff = 0;
        if ($request->type === 'in') {
            if ($attendance->check_in) {
                return back()->withErrors(['general' => 'Anda sudah melakukan clock in hari ini.']);
            }
            $attendance->check_in = $now;
            
            if ($now->greaterThan($shiftStartTime)) {
                $lateDiff = $now->diffInMinutes($shiftStartTime);
                $attendance->late_minutes = $lateDiff;
                $attendance->status = 'late';
            } else {
                $attendance->status = 'on_time';
            }
            
        } else {
            if (!$attendance->exists || !$attendance->check_in) {
                return back()->withErrors(['general' => 'Anda belum melakukan clock in.']);
            }
            if ($attendance->check_out) {
                return back()->withErrors(['general' => 'Anda sudah melakukan clock out hari ini.']);
            }
            $attendance->check_out = $now;
            // Jika out terlalu cepat bisa dikalkulasi nanti. Default biarkan status in-nya
        }

        $attendance->save();

        // Save Photo
        DB::table('attendance_photos')->insert([
            'attendance_record_id' => $attendance->id,
            'type' => $request->type,
            'photo_path' => $imagePath,
            'created_at' => $now
        ]);

        // Save Location Log
        DB::table('attendance_location_logs')->insert([
            'attendance_record_id' => $attendance->id,
            'type' => $request->type,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'accuracy' => 10,
            'server_distance' => round($distance),
            'created_at' => $now
        ]);

        return redirect('/attendance');
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

    private function saveBase64Image($base64Image, $employeeId, $type)
    {
        $image_parts = explode(";base64,", $base64Image);
        $image_base64 = base64_decode($image_parts[1]);
        $fileName = 'attendance/' . date('Y-m-d') . '_' . $employeeId . '_' . $type . '_' . uniqid() . '.jpg';
        
        Storage::disk('public')->put($fileName, $image_base64);
        
        return $fileName;
    }
}

<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ManualAttendanceRequest;
use App\Models\Attendance;

class ManualAttendanceController extends Controller
{
    private function checkActiveShift($employee)
    {
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', date('Y-m-d'))
            ->first();

        if (!$todayAttendance || !$todayAttendance->check_in) {
            return 'Akses dibatasi. Anda harus melakukan absensi masuk (Clock In) terlebih dahulu sebelum dapat mengakses menu Koreksi Absen.';
        }

        if ($todayAttendance->check_out) {
            return 'Akses ditutup. Anda telah menyelesaikan absensi pulang (Clock Out) untuk shift hari ini.';
        }

        return null;
    }

    public function index(Request $request)
    {
        $employee = $request->user()->employee;
        if (!$employee) abort(403, 'Akses khusus pegawai.');

        $shiftRestriction = $this->checkActiveShift($employee);
        if ($shiftRestriction) {
            $todayAttendance = Attendance::where('employee_id', $employee->id)->whereDate('date', date('Y-m-d'))->first();
            $isEnded = (bool) ($todayAttendance && $todayAttendance->check_out);
            return redirect()->route('dashboard')->with('shift_lock', [
                'title' => $isEnded ? 'Shift Kerja Hari Ini Selesai' : 'Akses Dibatasi: Wajib Presensi Masuk',
                'page' => 'Koreksi Absen',
                'status' => $isEnded ? 'ended' : 'not_started',
                'message' => $shiftRestriction,
            ]);
        }

        $requests = ManualAttendanceRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Employee/ManualAttendance', [
            'requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $employee = $request->user()->employee;
        if (!$employee) abort(403, 'Akses khusus pegawai.');

        $shiftRestriction = $this->checkActiveShift($employee);
        if ($shiftRestriction) {
            $todayAttendance = Attendance::where('employee_id', $employee->id)->whereDate('date', date('Y-m-d'))->first();
            $isEnded = (bool) ($todayAttendance && $todayAttendance->check_out);
            return redirect()->route('dashboard')->with('shift_lock', [
                'title' => $isEnded ? 'Shift Kerja Hari Ini Selesai' : 'Akses Dibatasi: Wajib Presensi Masuk',
                'page' => 'Koreksi Absen',
                'status' => $isEnded ? 'ended' : 'not_started',
                'message' => $shiftRestriction,
            ]);
        }

        $request->validate([
            'type' => 'required|in:in,out,both',
            'request_date' => 'required|date|before_or_equal:today',
            'request_time' => 'required',
            'reason' => 'required|string',
            'evidence' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120'
        ]);

        // Prevent duplicate pending requests for the same date & type
        $existing = ManualAttendanceRequest::where('employee_id', $employee->id)
            ->where('request_date', $request->request_date)
            ->where('type', $request->type)
            ->where('status', 'pending')
            ->exists();
            
        if ($existing) {
            return redirect()->back()->withErrors(['general' => 'Anda sudah memiliki pengajuan pending untuk tanggal dan tipe ini.']);
        }

        $evidencePath = null;
        if ($request->hasFile('evidence')) {
            $evidencePath = $request->file('evidence')->store('manual_attendance', 'local');
        }

        ManualAttendanceRequest::create([
            'employee_id' => $employee->id,
            'type' => $request->type,
            'request_date' => $request->request_date,
            'request_time' => $request->request_time,
            'reason' => $request->reason,
            'evidence_path' => $evidencePath,
            'status' => 'pending'
        ]);

        return redirect()->back()->with('message', 'Pengajuan absensi manual berhasil dikirim ke Owner.');
    }
}

<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ManualAttendanceRequest;
use App\Models\Attendance;
use Carbon\Carbon;

class ManualAttendanceController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $requests = ManualAttendanceRequest::with(['employee.user', 'employee.unit'])
            ->orderByRaw("FIELD(status, 'pending') DESC")
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Owner/ManualAttendanceApproval', [
            'requests' => $requests
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $correction = ManualAttendanceRequest::with('employee.user')->findOrFail($id);
        
        if ($correction->status !== 'pending') {
            return redirect()->back()->withErrors(['general' => 'Pengajuan sudah diproses sebelumnya.']);
        }

        $correction->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id
        ]);

        // If approved, update or create Attendance record
        if ($request->status === 'approved') {
            $attendance = Attendance::firstOrCreate(
                ['employee_id' => $correction->employee_id, 'date' => $correction->request_date],
                ['status' => 'present']
            );

            if ($correction->type === 'in' || $correction->type === 'both') {
                $attendance->clock_in = $correction->request_time;
                
                // Calculate late penalty (assume shift starts at 09:00 for Lumos, 10:00 for Luxeast)
                $shiftStart = $correction->employee->unit_id == 1 ? '09:00:00' : '10:00:00';
                $clockInTime = Carbon::parse($correction->request_date . ' ' . $correction->request_time);
                $shiftTime = Carbon::parse($correction->request_date . ' ' . $shiftStart);
                
                if ($clockInTime->greaterThan($shiftTime)) {
                    $attendance->late_minutes = $clockInTime->diffInMinutes($shiftTime);
                } else {
                    $attendance->late_minutes = 0;
                }
            }

            if ($correction->type === 'out' || $correction->type === 'both') {
                $attendance->clock_out = $correction->request_time;
            }
            
            $attendance->status = 'present';
            $attendance->save();
        }

        // Notify employee
        if ($correction->employee && $correction->employee->user) {
            $statusText = $request->status === 'approved' ? 'disetujui' : 'ditolak';
            $correction->employee->user->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Status Koreksi Absen',
                'message' => "Pengajuan koreksi absen untuk tanggal {$correction->request_date} telah {$statusText}."
            ]));
        }

        $statusStr = $request->status == 'approved' ? 'Disetujui' : 'Ditolak';
        return redirect()->back()->with('message', "Koreksi absensi berhasil $statusStr.");
    }
}

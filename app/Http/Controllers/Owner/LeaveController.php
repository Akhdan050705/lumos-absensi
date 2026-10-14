<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LeaveRequest;
use App\Models\Attendance;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $requests = LeaveRequest::with(['employee.user', 'employee.unit', 'leaveType'])
            ->orderByRaw("FIELD(status, 'pending') DESC")
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Owner/LeaveApproval', [
            'requests' => $requests
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $leaveReq = LeaveRequest::with(['employee.user', 'leaveType'])->findOrFail($id);

        // Mencegah proses ulang pengajuan yang sudah disetujui / ditolak
        if ($leaveReq->status !== 'pending') {
            return redirect()->back()->withErrors([
                'general' => 'Pengajuan cuti/izin ini sudah diproses sebelumnya.'
            ]);
        }

        $leaveReq->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id
        ]);

        // Jika disetujui, buat record absensi otomatis untuk rentang tanggal izin
        if ($request->status === 'approved') {
            $period = CarbonPeriod::create($leaveReq->start_date, $leaveReq->end_date);
            
            $typeName = strtolower($leaveReq->leaveType->name ?? '');
            $attendanceStatus = str_contains($typeName, 'libur') ? 'day_off' : 'leave';

            foreach ($period as $date) {
                Attendance::updateOrCreate(
                    [
                        'employee_id' => $leaveReq->employee_id,
                        'date' => $date->format('Y-m-d')
                    ],
                    [
                        'status' => $attendanceStatus,
                        'is_manual' => 1,
                        'late_minutes' => 0,
                        'penalty_amount' => 0,
                    ]
                );
            }
        }

        if ($leaveReq->employee && $leaveReq->employee->user) {
            $statusText = $request->status === 'approved' ? 'disetujui' : 'ditolak';
            $leaveReq->employee->user->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Status Cuti Diperbarui',
                'message' => "Pengajuan izin/cuti Anda ({$leaveReq->start_date} s.d {$leaveReq->end_date}) telah {$statusText} oleh Owner."
            ]));
        }

        $statusStr = $request->status == 'approved' ? 'Disetujui' : 'Ditolak';
        return redirect()->back()->with('message', "Pengajuan cuti/izin berhasil {$statusStr}.");
    }
}

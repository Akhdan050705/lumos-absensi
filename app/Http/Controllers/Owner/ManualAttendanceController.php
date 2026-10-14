<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ManualAttendanceRequest;
use App\Models\Attendance;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

        $correction = ManualAttendanceRequest::with('employee.user', 'employee.unit')->findOrFail($id);
        
        if ($correction->status !== 'pending') {
            return redirect()->back()->withErrors(['general' => 'Pengajuan koreksi ini sudah diproses sebelumnya.']);
        }

        $correction->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id
        ]);

        // If approved, update or create Attendance record with schema-compliant columns
        if ($request->status === 'approved') {
            $shift = Shift::where('unit_id', $correction->employee->unit_id)->where('is_active', 1)->first()
                ?? Shift::where('unit_id', $correction->employee->unit_id)->first();

            $attendance = Attendance::firstOrNew([
                'employee_id' => $correction->employee_id,
                'date' => $correction->request_date,
            ]);

            if ($shift) {
                $attendance->shift_id = $shift->id;
            }

            $attendance->is_manual = 1;
            $attendance->status = 'manual_approved';

            $parsedRequestTime = Carbon::parse($correction->request_date . ' ' . $correction->request_time);

            if ($correction->type === 'in' || $correction->type === 'both') {
                $attendance->check_in = $parsedRequestTime;
                
                // Get shift start time from DB (Lumos default 09:00, Luxeast default 11:00)
                $defaultStart = $correction->employee->unit_id == 1 ? '09:00:00' : '11:00:00';
                $shiftStartTimeStr = $shift ? $shift->start_time : $defaultStart;
                $shiftTime = Carbon::parse($correction->request_date . ' ' . $shiftStartTimeStr);
                
                if ($parsedRequestTime->greaterThan($shiftTime)) {
                    $lateMinutes = (int) $shiftTime->diffInMinutes($parsedRequestTime);
                    $attendance->late_minutes = $lateMinutes;

                    // Denda berjenjang setelah toleransi 30 menit
                    $penaltyBase = (float) (DB::table('system_settings')->where('setting_key', 'lumos_late_penalty_base')->value('setting_value') ?? 50000);
                    if ($lateMinutes > 30) {
                        $attendance->penalty_amount = ceil(($lateMinutes - 30) / 30) * $penaltyBase;
                    } else {
                        $attendance->penalty_amount = 0;
                    }
                } else {
                    $attendance->late_minutes = 0;
                    $attendance->penalty_amount = 0;
                }
            }

            if ($correction->type === 'out' || $correction->type === 'both') {
                $attendance->check_out = $parsedRequestTime;
            }

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

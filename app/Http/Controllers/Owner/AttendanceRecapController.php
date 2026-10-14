<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\BusinessUnit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceRecapController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) {
            abort(403, 'Akses khusus Owner.');
        }

        $date = $request->query('date', date('Y-m-d'));
        $month = (int) $request->query('month', date('n'));
        $year = (int) $request->query('year', date('Y'));
        $unitId = $request->query('unit_id');
        $viewMode = $request->query('view_mode', 'daily'); // 'daily' or 'monthly'

        $units = BusinessUnit::all();

        $query = Attendance::with(['employee.user', 'employee.unit', 'shift', 'photos'])
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc');

        if ($viewMode === 'daily') {
            if ($date) {
                $query->whereDate('date', $date);
            }
        } else {
            $query->whereMonth('date', $month)->whereYear('date', $year);
        }

        if ($unitId) {
            $query->whereHas('employee', function ($q) use ($unitId) {
                $q->where('unit_id', $unitId);
            });
        }

        $records = $query->get()->map(function ($att) {
            $photoIn = $att->photos->firstWhere('type', 'in');
            $photoOut = $att->photos->firstWhere('type', 'out');

            return [
                'id' => $att->id,
                'employee_id' => $att->employee_id,
                'employee_name' => $att->employee->user->name ?? 'Pegawai',
                'employee_code' => $att->employee->employee_code ?? '-',
                'unit_id' => $att->employee->unit_id ?? null,
                'unit_name' => $att->employee->unit->name ?? '-',
                'shift_name' => $att->shift->name ?? 'Shift Reguler',
                'shift_start' => $att->shift ? substr($att->shift->start_time, 0, 5) : '-',
                'shift_end' => $att->shift ? substr($att->shift->end_time, 0, 5) : '-',
                'date' => $att->date ? $att->date->format('Y-m-d') : '-',
                'check_in' => $att->check_in ? $att->check_in->format('H:i:s') : null,
                'check_out' => $att->check_out ? $att->check_out->format('H:i:s') : null,
                'status' => $att->status,
                'late_minutes' => (int) $att->late_minutes,
                'penalty_amount' => (float) $att->penalty_amount,
                'penalty_waived' => (bool) $att->penalty_waived,
                'waived_reason' => $att->waived_reason,
                'late_reason' => $att->late_reason,
                'late_notes' => $att->late_notes,
                'early_leave_minutes' => (int) $att->early_leave_minutes,
                'early_leave_reason' => $att->early_leave_reason,
                'early_leave_notes' => $att->early_leave_notes,
                'early_leave_status' => $att->early_leave_status ?? 'none',
                'early_leave_penalty' => (float) $att->early_leave_penalty,
                'early_leave_approval_notes' => $att->early_leave_approval_notes,
                'photo_in' => $photoIn ? '/files/' . $photoIn->photo_path : null,
                'photo_out' => $photoOut ? '/files/' . $photoOut->photo_path : null,
            ];
        });

        // Summary statistics
        $totalPresent = $records->count();
        $totalOnTime = $records->where('status', 'on_time')->count();
        $totalLate = $records->where('late_minutes', '>', 0)->count();
        $totalPenalty = $records->where('penalty_waived', false)->sum('penalty_amount') + $records->where('early_leave_status', 'rejected')->sum('early_leave_penalty');
        $totalWaived = $records->where('penalty_waived', true)->count();
        $totalEarlyLeave = $records->where('early_leave_minutes', '>', 0)->count();

        return Inertia::render('Owner/AttendanceRecap', [
            'records' => $records,
            'units' => $units,
            'filters' => [
                'date' => $date,
                'month' => $month,
                'year' => $year,
                'unit_id' => $unitId ? (int)$unitId : '',
                'view_mode' => $viewMode,
            ],
            'summary' => [
                'total_present' => $totalPresent,
                'total_on_time' => $totalOnTime,
                'total_late' => $totalLate,
                'total_penalty' => $totalPenalty,
                'total_waived' => $totalWaived,
                'total_early_leave' => $totalEarlyLeave,
            ]
        ]);
    }

    public function adjustPenalty(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) {
            abort(403, 'Akses khusus Owner.');
        }

        $request->validate([
            'penalty_waived' => 'required|boolean',
            'penalty_amount' => 'required|numeric|min:0',
            'waived_reason' => 'nullable|string|max:500'
        ]);

        $attendance = Attendance::findOrFail($id);

        $attendance->update([
            'penalty_waived' => $request->penalty_waived,
            'penalty_amount' => $request->penalty_amount,
            'waived_reason' => $request->waived_reason
        ]);

        return redirect()->back()->with('message', 'Penyesuaian denda keterlambatan berhasil disimpan!');
    }

    public function confirmEarlyLeave(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) {
            abort(403, 'Akses khusus Owner.');
        }

        $request->validate([
            'action' => 'required|in:approve,reject',
            'early_leave_penalty' => 'nullable|numeric|min:0',
            'approval_notes' => 'nullable|string|max:500'
        ]);

        $attendance = Attendance::findOrFail($id);

        if ($request->action === 'approve') {
            $attendance->update([
                'early_leave_status' => 'approved',
                'early_leave_penalty' => 0,
                'early_leave_approval_notes' => $request->approval_notes ?: 'Disetujui oleh Owner'
            ]);
            $message = 'Pulang lebih awal berhasil disetujui (ACC)! Karyawan tidak dikenakan denda.';
        } else {
            $penalty = (float) ($request->early_leave_penalty ?? 0);
            $attendance->update([
                'early_leave_status' => 'rejected',
                'early_leave_penalty' => $penalty,
                'early_leave_approval_notes' => $request->approval_notes ?: 'Ditolak oleh Owner'
            ]);
            $message = 'Pulang lebih awal ditolak. Denda sebesar Rp ' . number_format($penalty, 0, ',', '.') . ' telah ditetapkan.';
        }

        return redirect()->back()->with('message', $message);
    }
}

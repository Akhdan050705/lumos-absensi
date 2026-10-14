<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LeaveType;
use App\Models\LeaveRequest;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $employee = $request->user()->employee;
        if (!$employee) abort(403, 'Akses khusus pegawai.');

        $leaveTypes = LeaveType::all();
        $history = LeaveRequest::where('employee_id', $employee->id)
            ->with(['leaveType', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Employee/Leave', [
            'leaveTypes' => $leaveTypes,
            'history' => $history
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120'
        ]);

        $employee = $request->user()->employee;

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leaves', 'local');
        }

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $request->leave_type_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'attachment_path' => $attachmentPath,
            'status' => 'pending'
        ]);

        // Notify owners
        $owners = \App\Models\User::whereHas('roles', function($q) { $q->where('slug', 'owner'); })->get();
        foreach ($owners as $owner) {
            $owner->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Pengajuan Cuti Baru',
                'message' => "{$request->user()->name} mengajukan cuti/izin baru. Silakan tinjau."
            ]));
        }

        return redirect()->back()->with('message', 'Pengajuan cuti/izin berhasil dikirim dan menunggu persetujuan.');
    }
}

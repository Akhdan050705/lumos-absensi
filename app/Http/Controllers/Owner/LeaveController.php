<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LeaveRequest;

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

        $leaveReq = LeaveRequest::findOrFail($id);
        $leaveReq->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id
        ]);

        if ($leaveReq->employee && $leaveReq->employee->user) {
            $statusText = $request->status === 'approved' ? 'disetujui' : 'ditolak';
            $leaveReq->employee->user->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Status Cuti Diperbarui',
                'message' => "Pengajuan cuti Anda telah {$statusText} oleh Owner."
            ]));
        }

        $statusStr = $request->status == 'approved' ? 'Disetujui' : 'Ditolak';
        return redirect()->back()->with('message', "Pengajuan cuti/izin berhasil $statusStr.");
    }
}

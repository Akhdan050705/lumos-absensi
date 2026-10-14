<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ManualAttendanceRequest;

class ManualAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $employee = $request->user()->employee;
        if (!$employee) abort(403, 'Akses khusus pegawai.');

        $requests = ManualAttendanceRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Employee/ManualAttendance', [
            'requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out,both',
            'request_date' => 'required|date|before_or_equal:today',
            'request_time' => 'required',
            'reason' => 'required|string',
            'evidence' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120'
        ]);

        $employee = $request->user()->employee;
        
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
            $evidencePath = $request->file('evidence')->store('manual_attendance', 'public');
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
        
        // Notify Owners
        $owners = \App\Models\User::whereHas('roles', function($q) { $q->where('slug', 'owner'); })->get();
        foreach ($owners as $owner) {
            $owner->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Pengajuan Koreksi Absen',
                'message' => "{$request->user()->name} mengajukan koreksi absen manual. Silakan tinjau."
            ]));
        }

        return redirect()->back()->with('message', 'Pengajuan koreksi absen berhasil dikirim.');
    }
}

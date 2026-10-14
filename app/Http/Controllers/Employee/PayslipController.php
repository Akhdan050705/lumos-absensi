<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PayrollCalculation;

class PayslipController extends Controller
{
    public function index(Request $request)
    {
        $employee = $request->user()->employee;
        if (!$employee) abort(403, 'Akses khusus pegawai.');

        // Hanya tampilkan slip gaji yang telah disetujui atau dibayarkan oleh Owner (bukan draft)
        $payslips = PayrollCalculation::where('employee_id', $employee->id)
            ->whereHas('period', function($q) {
                $q->whereIn('status', ['approved', 'paid']);
            })
            ->with(['period.unit', 'details'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Employee/Payslip', [
            'payslips' => $payslips,
            'employee' => [
                'name' => $request->user()->name,
                'employee_code' => $employee->employee_code,
                'unit' => $employee->unit
            ]
        ]);
    }
}

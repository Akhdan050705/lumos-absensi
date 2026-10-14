<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BusinessUnit;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\BarberTransaction;
use App\Models\PayrollPeriod;
use App\Models\PayrollCalculation;
use App\Models\PayrollDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403, 'Akses khusus Owner.');

        $units = BusinessUnit::all();
        $periods = PayrollPeriod::with('unit')->orderBy('start_date', 'desc')->get();

        return Inertia::render('Owner/Payroll', [
            'units' => $units,
            'periods' => $periods
        ]);
    }

    public function generate(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $request->validate([
            'unit_id' => 'required|exists:business_units,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer'
        ]);

        $unitId = $request->unit_id;
        $month = $request->month;
        $year = $request->year;

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        $existingPeriod = PayrollPeriod::where('unit_id', $unitId)
            ->where('start_date', $startDate->format('Y-m-d'))
            ->first();

        if ($existingPeriod) {
            return redirect()->back()->withErrors(['general' => 'Payroll untuk periode ini sudah pernah dibuat.']);
        }

        DB::beginTransaction();
        try {
            $period = PayrollPeriod::create([
                'unit_id' => $unitId,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => 'draft'
            ]);

            $employees = Employee::where('unit_id', $unitId)->where('status', 'active')->get();

            foreach ($employees as $emp) {
                $grossPay = 0;
                $deductions = 0;

                $calc = PayrollCalculation::create([
                    'employee_id' => $emp->id,
                    'period_id' => $period->id,
                    'gross_pay' => 0,
                    'total_deductions' => 0,
                    'net_pay' => 0,
                ]);

                // 1. Gaji Pokok
                $baseSalary = ($unitId == 1) ? 2500000 : 1500000;
                $grossPay += $baseSalary;
                PayrollDetail::create([
                    'calculation_id' => $calc->id,
                    'description' => 'Gaji Pokok',
                    'type' => 'earning',
                    'amount' => $baseSalary
                ]);

                // 2. Denda Keterlambatan
                $attendances = Attendance::where('employee_id', $emp->id)
                    ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->get();
                
                $totalLateMinutes = $attendances->sum('late_minutes');
                if ($totalLateMinutes > 0) {
                    $latePenalty = $totalLateMinutes * 500; // Rp 500/menit
                    $deductions += $latePenalty;
                    
                    PayrollDetail::create([
                        'calculation_id' => $calc->id,
                        'description' => "Potongan Keterlambatan ({$totalLateMinutes} menit)",
                        'type' => 'deduction',
                        'amount' => $latePenalty
                    ]);
                }

                // 3. Komisi Bagi Hasil (Khusus Luxeast)
                if ($unitId == 2) {
                    $transactions = BarberTransaction::where('employee_id', $emp->id)
                        ->whereBetween('transaction_time', [$startDate->format('Y-m-d 00:00:00'), $endDate->format('Y-m-d 23:59:59')])
                        ->get();
                    
                    $totalRevenue = $transactions->sum('price_snapshot');
                    if ($totalRevenue > 0) {
                        $revenueShare = $totalRevenue * 0.30;
                        $grossPay += $revenueShare;

                        PayrollDetail::create([
                            'calculation_id' => $calc->id,
                            'description' => 'Komisi Bagi Hasil (30%)',
                            'type' => 'earning',
                            'amount' => $revenueShare
                        ]);
                    }
                }

                $netPay = $grossPay - $deductions;
                $calc->update([
                    'gross_pay' => $grossPay,
                    'total_deductions' => $deductions,
                    'net_pay' => $netPay
                ]);

                if ($emp->user) {
                    $monthName = $startDate->format('F Y');
                    $emp->user->notify(new \App\Notifications\GeneralNotification([
                        'title' => 'Slip Gaji Baru',
                        'message' => "Slip gaji periode {$monthName} telah digenerate. Silakan cek menu Slip Gaji."
                    ]));
                }
            }

            DB::commit();
            return redirect()->back()->with('message', 'Payroll berhasil digenerate!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['general' => 'Gagal generate payroll: ' . $e->getMessage()]);
        }
    }

    public function show(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $period = PayrollPeriod::with([
            'unit',
            'calculations.employee.user',
            'calculations.details'
        ])->findOrFail($id);

        return Inertia::render('Owner/PayrollDetail', [
            'period' => $period
        ]);
    }
}

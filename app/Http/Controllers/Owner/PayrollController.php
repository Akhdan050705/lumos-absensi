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
            return redirect()->back()->withErrors(['general' => 'Payroll untuk unit dan periode ini sudah pernah dibuat.']);
        }

        // Ambil konfigurasi gaji pokok dari system_settings
        $baseSalaryLumos = (float) (DB::table('system_settings')->where('setting_key', 'lumos_base_salary')->value('setting_value') ?? 2500000);
        $baseSalaryLuxeast = (float) (DB::table('system_settings')->where('setting_key', 'luxeast_base_salary')->value('setting_value') ?? 1500000);
        $baseSalary = ($unitId == 1) ? $baseSalaryLumos : $baseSalaryLuxeast;

        // Ambil default komisi bagi hasil Luxeast dari revenue_share_rules / system_settings
        $defaultRule = DB::table('revenue_share_rules')->where('unit_id', 2)->whereNull('employee_id')->first();
        $defaultSharePct = $defaultRule ? (float)$defaultRule->percentage : (float)(DB::table('system_settings')->where('setting_key', 'barber_global_revenue_share')->value('setting_value') ?? 30.0);

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

                // 1. Gaji Pokok (Berdasarkan system_settings & payroll_components)
                $grossPay += $baseSalary;
                PayrollDetail::create([
                    'calculation_id' => $calc->id,
                    'description' => 'Gaji Pokok',
                    'type' => 'earning',
                    'amount' => $baseSalary
                ]);

                // 2. Denda Keterlambatan (Berdasarkan penalty_amount aktual di attendance_records)
                $attendances = Attendance::where('employee_id', $emp->id)
                    ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->get();
                
                $totalLateMinutes = $attendances->sum('late_minutes');
                $latePenalty = (float) $attendances->sum('penalty_amount');

                if ($latePenalty > 0) {
                    $deductions += $latePenalty;
                    PayrollDetail::create([
                        'calculation_id' => $calc->id,
                        'description' => "Potongan Denda Keterlambatan ({$totalLateMinutes} menit)",
                        'type' => 'deduction',
                        'amount' => $latePenalty
                    ]);
                }

                // 3. Komisi Bagi Hasil (Khusus Luxeast - dicek dari revenue_share_rules per pegawai)
                if ($unitId == 2) {
                    $empRule = DB::table('revenue_share_rules')
                        ->where('unit_id', 2)
                        ->where('employee_id', $emp->id)
                        ->first();
                    $sharePercentage = $empRule ? (float)$empRule->percentage : $defaultSharePct;

                    $transactions = BarberTransaction::where('employee_id', $emp->id)
                        ->whereBetween('transaction_time', [$startDate->format('Y-m-d 00:00:00'), $endDate->format('Y-m-d 23:59:59')])
                        ->get();
                    
                    $totalRevenue = (float) $transactions->sum('price_snapshot');
                    if ($totalRevenue > 0) {
                        $revenueShare = $totalRevenue * ($sharePercentage / 100);
                        $grossPay += $revenueShare;

                        PayrollDetail::create([
                            'calculation_id' => $calc->id,
                            'description' => "Komisi Bagi Hasil ({$sharePercentage}%)",
                            'type' => 'earning',
                            'amount' => $revenueShare
                        ]);
                    }
                }

                $netPay = max(0, $grossPay - $deductions);
                $calc->update([
                    'gross_pay' => $grossPay,
                    'total_deductions' => $deductions,
                    'net_pay' => $netPay
                ]);
            }

            DB::commit();
            return redirect()->back()->with('message', 'Draft Payroll berhasil digenerate! Silakan review dan setujui untuk merilis slip gaji.');

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

    public function approve(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $period = PayrollPeriod::with(['unit', 'calculations.employee.user'])->findOrFail($id);

        if ($period->status === 'approved' || $period->status === 'paid') {
            return redirect()->back()->withErrors(['general' => 'Payroll ini sudah disetujui sebelumnya.']);
        }

        $period->update(['status' => 'approved']);

        // Rilis slip gaji & kirim notifikasi ke masing-masing pegawai
        $monthName = Carbon::parse($period->start_date)->translatedFormat('F Y');
        foreach ($period->calculations as $calc) {
            if ($calc->employee && $calc->employee->user) {
                $calc->employee->user->notify(new \App\Notifications\GeneralNotification([
                    'title' => 'Slip Gaji Telah Disetujui',
                    'message' => "Slip gaji periode {$monthName} telah disetujui oleh Owner dan siap diunduh di menu Slip Gaji."
                ]));
            }
        }

        return redirect()->back()->with('message', "Payroll periode {$monthName} berhasil disetujui dan slip gaji resmi dirilis ke pegawai!");
    }
}

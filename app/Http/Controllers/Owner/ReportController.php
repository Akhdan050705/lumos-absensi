<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SalesSnapshot;
use App\Models\BarberTransaction;
use App\Models\PayrollCalculation;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $month = $request->query('month', date('m'));
        $year = $request->query('year', date('Y'));
        $date = $request->query('date', null);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // 1. Total Penjualan Lumos: Hanya hitung closing (kumulatif harian) agar tidak menghitung ganda dengan handover
        $lumosRevenue = SalesSnapshot::where('unit_id', 1)
            ->where('type', 'closing')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('pos_total');

        // Jika belum ada closing di bulan berjalan tetapi ada handover, fallback hitung dari snapshot terakhir per hari
        if ($lumosRevenue == 0) {
            $lumosRevenue = SalesSnapshot::where('unit_id', 1)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereIn('id', function($q) use ($startDate, $endDate) {
                    $q->selectRaw('MAX(id)')
                      ->from('sales_snapshots')
                      ->where('unit_id', 1)
                      ->whereBetween('created_at', [$startDate, $endDate])
                      ->groupByRaw('DATE(created_at)');
                })
                ->sum('pos_total');
        }

        // 2. Total Penjualan Luxeast (Dari Transaksi Barber)
        $luxeastRevenue = BarberTransaction::whereBetween('transaction_time', [$startDate, $endDate])
            ->sum('price_snapshot');

        // 3. Total Beban Gaji (Payroll)
        $totalPayrollExpense = PayrollCalculation::whereHas('period', function($q) use ($startDate, $endDate) {
            $q->where('start_date', '>=', $startDate->format('Y-m-d'))
              ->where('end_date', '<=', $endDate->format('Y-m-d'));
        })->sum('net_pay');

        // --- Laporan Kas Harian (Lumos POS Snapshots) ---
        $snapshotQuery = SalesSnapshot::with(['employee.user', 'unit'])
            ->orderBy('created_at', 'desc');

        if ($date) {
            $snapshotQuery->whereDate('created_at', $date);
        } else {
            $snapshotQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        $snapshots = $snapshotQuery->get();

        // --- Laporan Transaksi Harian (Luxeast Barbershop) ---
        $txQuery = BarberTransaction::with(['employee.user', 'service', 'paymentMethod']);

        if ($date) {
            $txQuery->whereDate('transaction_time', $date);
        } else {
            $txQuery->whereBetween('transaction_time', [$startDate, $endDate]);
        }

        $barberTransactions = $txQuery->orderBy('transaction_time', 'desc')->get();

        // Group barber transactions by date for daily summary
        $barberDaily = $barberTransactions->groupBy(function($tx) {
            return Carbon::parse($tx->transaction_time)->format('Y-m-d');
        })->map(function($group, $dateKey) {
            return [
                'date' => $dateKey,
                'total' => $group->sum('price_snapshot'),
                'count' => $group->count(),
                'transactions' => $group->values(),
            ];
        })->values();

        return Inertia::render('Owner/Report', [
            'filter' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'date' => $date,
            ],
            'summary' => [
                'lumos_revenue' => $lumosRevenue,
                'luxeast_revenue' => $luxeastRevenue,
                'total_revenue' => $lumosRevenue + $luxeastRevenue,
                'payroll_expense' => $totalPayrollExpense,
                'net_profit' => ($lumosRevenue + $luxeastRevenue) - $totalPayrollExpense
            ],
            'snapshots' => $snapshots,
            'barberDaily' => $barberDaily,
        ]);
    }

    public function verifySnapshot(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $request->validate([
            'status' => 'required|in:verified,rejected,revision_requested,locked'
        ]);

        $snapshot = SalesSnapshot::findOrFail($id);

        // Penegakan aturan: Laporan terkunci (locked) tidak boleh diubah lagi
        if ($snapshot->status === 'locked') {
            return redirect()->back()->withErrors([
                'general' => 'Laporan kas ini berstatus locked (terkunci) dan tidak dapat dimodifikasi lagi.'
            ]);
        }

        $snapshot->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id
        ]);

        // Notify employee
        if ($snapshot->employee && $snapshot->employee->user) {
            $statusLabels = [
                'verified' => 'diverifikasi (Benar)',
                'rejected' => 'ditolak',
                'revision_requested' => 'diminta revisi',
                'locked' => 'dikunci permanen oleh Owner',
            ];
            $statusText = $statusLabels[$request->status] ?? $request->status;
            $snapshot->employee->user->notify(new \App\Notifications\GeneralNotification([
                'title' => 'Laporan Kas Diperbarui',
                'message' => "Laporan kas tanggal " . Carbon::parse($snapshot->created_at)->format('d/m/Y') . " telah {$statusText}."
            ]));
        }

        return redirect()->back()->with('message', 'Status laporan kas berhasil diperbarui.');
    }
}

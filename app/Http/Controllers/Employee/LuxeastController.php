<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Service;
use App\Models\PaymentMethod;
use App\Models\BarberTransaction;
use App\Models\Employee;
use App\Models\BusinessUnit;
use Carbon\Carbon;

class LuxeastController extends Controller
{
    public function cashier(Request $request)
    {
        $user = $request->user();
        if (!$user->employee || $user->employee->unit_id != 2) {
            abort(403, 'Akses ditolak. Anda bukan pegawai Luxeast Barbershop.');
        }

        // Ambil data untuk form transaksi
        $services = Service::where('status', 1)->get();
        $paymentMethods = PaymentMethod::where('unit_id', 2)->where('is_active', 1)->get();
        
        // Ambil daftar barber/kapster (semua pegawai Luxeast)
        $barbers = Employee::where('unit_id', 2)
                           ->with('user')
                           ->get()
                           ->map(function($emp) {
                               return [
                                   'id' => $emp->id,
                                   'name' => $emp->user->name ?? 'Barber ' . $emp->id
                               ];
                           });

        // Riwayat transaksi hari ini
        $todayTransactions = BarberTransaction::whereDate('transaction_time', date('Y-m-d'))
            ->with(['employee.user', 'service', 'paymentMethod'])
            ->orderBy('transaction_time', 'desc')
            ->get();

        return Inertia::render('Luxeast/Cashier', [
            'services' => $services,
            'paymentMethods' => $paymentMethods,
            'barbers' => $barbers,
            'todayTransactions' => $todayTransactions
        ]);
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'service_id' => 'required|exists:services,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'customer_name' => 'nullable|string|max:255'
        ]);

        $service = Service::findOrFail($request->service_id);

        BarberTransaction::create([
            'employee_id' => $request->employee_id,
            'service_id' => $request->service_id,
            'transaction_time' => Carbon::now(),
            'price_snapshot' => $service->price,
            'customer_name' => $request->customer_name ?: 'Guest',
            'payment_method_id' => $request->payment_method_id
        ]);

        return redirect()->back()->with('message', 'Transaksi berhasil dicatat!');
    }
}

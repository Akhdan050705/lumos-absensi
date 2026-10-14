<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Service;
use App\Models\PaymentMethod;
use App\Models\BarberTransaction;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class LuxeastController extends Controller
{
    public function cashier(Request $request)
    {
        $user = $request->user();
        if (!$user->employee || $user->employee->unit_id != 2) {
            abort(403, 'Akses ditolak. Anda bukan pegawai Luxeast Barbershop.');
        }

        // Ambil data untuk form transaksi unit Luxeast (unit_id = 2)
        $services = Service::where('status', 1)->get();
        $paymentMethods = PaymentMethod::where('unit_id', 2)->where('is_active', 1)->get();
        
        // Ambil daftar barber aktif khusus Luxeast
        $barbers = Employee::where('unit_id', 2)
                           ->where('status', 'active')
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
            ->whereHas('employee', function($q) {
                $q->where('unit_id', 2);
            })
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
        $user = $request->user();
        if (!$user->employee || $user->employee->unit_id != 2) {
            abort(403, 'Akses ditolak. Anda bukan pegawai Luxeast Barbershop.');
        }

        $request->validate([
            'employee_id' => [
                'required',
                Rule::exists('employees', 'id')->where(function ($query) {
                    $query->where('unit_id', 2)->where('status', 'active');
                })
            ],
            'service_id' => 'required|exists:services,id',
            'payment_method_id' => [
                'required',
                Rule::exists('payment_methods', 'id')->where(function ($query) {
                    $query->where('unit_id', 2);
                })
            ],
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

        return redirect()->back()->with('message', 'Transaksi Luxeast berhasil dicatat!');
    }
}

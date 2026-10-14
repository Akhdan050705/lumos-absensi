<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarberTransaction extends Model
{
    protected $table = 'barber_transactions';
    protected $fillable = [
        'employee_id',
        'service_id',
        'transaction_time',
        'price_snapshot',
        'customer_name',
        'payment_method_id'
    ];

    protected $casts = [
        'transaction_time' => 'datetime'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id', 'id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollPeriod extends Model
{
    protected $table = 'payroll_periods';
    protected $fillable = ['unit_id', 'start_date', 'end_date', 'status'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }

    public function calculations()
    {
        return $this->hasMany(PayrollCalculation::class, 'period_id', 'id');
    }
}

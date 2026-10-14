<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollCalculation extends Model
{
    protected $table = 'payroll_calculations';
    protected $fillable = ['employee_id', 'period_id', 'gross_pay', 'total_deductions', 'net_pay', 'status'];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function period()
    {
        return $this->belongsTo(PayrollPeriod::class, 'period_id', 'id');
    }

    public function details()
    {
        return $this->hasMany(PayrollDetail::class, 'calculation_id', 'id');
    }
}

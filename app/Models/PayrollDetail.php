<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollDetail extends Model
{
    protected $table = 'payroll_details';
    public $timestamps = false; // Based on schema
    protected $fillable = ['calculation_id', 'component_id', 'description', 'type', 'amount'];

    public function calculation()
    {
        return $this->belongsTo(PayrollCalculation::class, 'calculation_id', 'id');
    }
}

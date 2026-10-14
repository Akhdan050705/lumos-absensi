<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    protected $primaryKey = 'employee_id';
    public $incrementing = false;
    
    protected $fillable = ['employee_id', 'full_name', 'phone', 'bank_name', 'bank_account'];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }
}

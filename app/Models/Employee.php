<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = ['user_id', 'unit_id', 'employee_code', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }

    public function profile()
    {
        return $this->hasOne(EmployeeProfile::class, 'employee_id', 'id');
    }
}

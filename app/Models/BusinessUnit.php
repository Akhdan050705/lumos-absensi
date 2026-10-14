<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessUnit extends Model
{
    protected $fillable = ['name', 'type'];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'unit_id', 'id');
    }
}

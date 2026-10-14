<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $table = 'work_shifts';
    protected $fillable = ['unit_id', 'name', 'start_time', 'end_time'];

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }
}

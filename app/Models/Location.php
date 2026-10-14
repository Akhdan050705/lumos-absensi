<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $table = 'unit_locations';
    protected $fillable = ['unit_id', 'address', 'latitude', 'longitude', 'radius', 'accuracy_limit'];

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }
}

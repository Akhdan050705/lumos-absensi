<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $table = 'payment_methods';
    protected $fillable = ['unit_id', 'name', 'is_active'];

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }
}

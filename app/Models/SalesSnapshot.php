<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesSnapshot extends Model
{
    protected $table = 'sales_snapshots';
    protected $fillable = [
        'unit_id',
        'employee_id',
        'shift_id',
        'type',
        'pos_total',
        'previous_snapshot_id',
        'expected_cash',
        'actual_cash',
        'variance',
        'notes',
        'photo_path',
        'status',
        'reviewed_by'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id', 'id');
    }

    public function unit()
    {
        return $this->belongsTo(BusinessUnit::class, 'unit_id', 'id');
    }
}

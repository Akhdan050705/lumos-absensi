<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $table = 'attendance_records';

    protected $fillable = [
        'employee_id',
        'shift_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'late_minutes',
        'penalty_amount',
        'late_reason',
        'late_notes',
        'penalty_waived',
        'waived_reason',
        'early_leave_minutes',
        'early_leave_reason',
        'early_leave_notes',
        'early_leave_status',
        'early_leave_penalty',
        'early_leave_approval_notes',
        'is_manual'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'penalty_waived' => 'boolean',
        'early_leave_minutes' => 'integer',
        'early_leave_penalty' => 'float',
        'is_manual' => 'boolean'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id', 'id');
    }

    public function photos()
    {
        return $this->hasMany(AttendancePhoto::class, 'attendance_record_id', 'id');
    }
}

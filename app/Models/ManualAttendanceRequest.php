<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualAttendanceRequest extends Model
{
    protected $table = 'manual_attendance_requests';

    protected $fillable = [
        'employee_id',
        'type',
        'request_date',
        'request_time',
        'reason',
        'evidence_path',
        'status',
        'reviewed_by'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

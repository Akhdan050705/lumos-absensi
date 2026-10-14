<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendancePhoto extends Model
{
    protected $table = 'attendance_photos';
    public $timestamps = false;

    protected $fillable = [
        'attendance_record_id',
        'type',
        'photo_path',
        'liveness_score',
        'match_score',
        'created_at'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class, 'attendance_record_id', 'id');
    }
}

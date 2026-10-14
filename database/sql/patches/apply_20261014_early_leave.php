<?php

require __DIR__ . '/../../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "1. Adding columns to attendance_records...\n";
Schema::table('attendance_records', function($table) {
    if (!Schema::hasColumn('attendance_records', 'early_leave_minutes')) {
        $table->integer('early_leave_minutes')->default(0)->after('waived_reason');
    }
    if (!Schema::hasColumn('attendance_records', 'early_leave_reason')) {
        $table->string('early_leave_reason', 255)->nullable()->after('early_leave_minutes');
    }
    if (!Schema::hasColumn('attendance_records', 'early_leave_notes')) {
        $table->text('early_leave_notes')->nullable()->after('early_leave_reason');
    }
    if (!Schema::hasColumn('attendance_records', 'early_leave_status')) {
        $table->string('early_leave_status', 50)->default('none')->after('early_leave_notes');
    }
    if (!Schema::hasColumn('attendance_records', 'early_leave_penalty')) {
        $table->decimal('early_leave_penalty', 12, 2)->default(0)->after('early_leave_status');
    }
    if (!Schema::hasColumn('attendance_records', 'early_leave_approval_notes')) {
        $table->string('early_leave_approval_notes', 255)->nullable()->after('early_leave_penalty');
    }
});

echo "2. Adding Full Shift (10:00 - 22:00) to work_shifts...\n";
DB::table('work_shifts')->updateOrInsert(
    ['id' => 4],
    ['unit_id' => 1, 'name' => 'Full Shift', 'start_time' => '10:00:00', 'end_time' => '22:00:00', 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()]
);
DB::table('work_shifts')->updateOrInsert(
    ['id' => 5],
    ['unit_id' => 2, 'name' => 'Full Shift', 'start_time' => '10:00:00', 'end_time' => '22:00:00', 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()]
);

echo "3. Streamlining leave_types...\n";
DB::table('leave_types')->where('id', 1)->update(['name' => 'Izin Sakit']);
DB::table('leave_types')->where('id', 2)->update(['name' => 'Cuti / Tidak Masuk']);
DB::table('leave_types')->where('id', '>', 2)->delete();

echo "DONE SUCCESS!\n";

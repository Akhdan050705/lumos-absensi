<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use Inertia\Inertia;

// Root redirect to login
Route::get('/', function () {
    return redirect()->route('login');
});

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
    
    // Global Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile Settings
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'index'])->name('profile.index');
    Route::post('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.password.update');
    
    // Notifications
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // Private Files Access
    Route::get('/files/{path}', [\App\Http\Controllers\FileController::class, 'show'])->where('path', '.*')->name('files.show');

    // -- Owner Routes --
    Route::middleware('role:owner')->group(function() {
        Route::get('/owner/payroll', [\App\Http\Controllers\Owner\PayrollController::class, 'index'])->name('owner.payroll.index');
        Route::post('/owner/payroll/generate', [\App\Http\Controllers\Owner\PayrollController::class, 'generate'])->name('owner.payroll.generate');
        Route::get('/owner/payroll/{id}', [\App\Http\Controllers\Owner\PayrollController::class, 'show'])->name('owner.payroll.show');
        Route::patch('/owner/payroll/{id}/approve', [\App\Http\Controllers\Owner\PayrollController::class, 'approve'])->name('owner.payroll.approve');
        Route::get('/owner/reports', [\App\Http\Controllers\Owner\ReportController::class, 'index'])->name('owner.reports.index');
        Route::patch('/owner/reports/snapshot/{id}/verify', [\App\Http\Controllers\Owner\ReportController::class, 'verifySnapshot'])->name('owner.reports.verify-snapshot');
        Route::get('/owner/leaves', [\App\Http\Controllers\Owner\LeaveController::class, 'index'])->name('owner.leaves.index');
        Route::patch('/owner/leaves/{id}', [\App\Http\Controllers\Owner\LeaveController::class, 'update'])->name('owner.leaves.update');
        Route::get('/owner/employees', [\App\Http\Controllers\Owner\EmployeeController::class, 'index'])->name('owner.employees.index');
        Route::post('/owner/employees', [\App\Http\Controllers\Owner\EmployeeController::class, 'store'])->name('owner.employees.store');
        Route::patch('/owner/employees/{id}/toggle', [\App\Http\Controllers\Owner\EmployeeController::class, 'toggleStatus'])->name('owner.employees.toggle');
        
        Route::get('/owner/manual-attendance', [\App\Http\Controllers\Owner\ManualAttendanceController::class, 'index'])->name('owner.manual-attendance.index');
        Route::patch('/owner/manual-attendance/{id}', [\App\Http\Controllers\Owner\ManualAttendanceController::class, 'update'])->name('owner.manual-attendance.update');
    });

    // -- Employee Common Routes --
    Route::middleware('role:employee_lumos,employee_luxeast')->group(function() {
        Route::get('/attendance', [\App\Http\Controllers\Employee\AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/attendance/camera', [\App\Http\Controllers\Employee\AttendanceController::class, 'camera'])->name('attendance.camera');
        Route::post('/attendance/store', [\App\Http\Controllers\Employee\AttendanceController::class, 'store'])->name('attendance.store');
        
        Route::get('/leave', [\App\Http\Controllers\Employee\LeaveController::class, 'index'])->name('leave.index');
        Route::post('/leave', [\App\Http\Controllers\Employee\LeaveController::class, 'store'])->name('leave.store');
        
        Route::get('/manual-attendance', [\App\Http\Controllers\Employee\ManualAttendanceController::class, 'index'])->name('manual-attendance.index');
        Route::post('/manual-attendance', [\App\Http\Controllers\Employee\ManualAttendanceController::class, 'store'])->name('manual-attendance.store');
        
        Route::get('/payslip', [\App\Http\Controllers\Employee\PayslipController::class, 'index'])->name('payslip.index');
    });

    // -- Employee Lumos Routes --
    Route::middleware('role:employee_lumos')->group(function() {
        Route::get('/lumos/pos', [\App\Http\Controllers\Employee\LumosController::class, 'pos'])->name('lumos.pos');
        Route::post('/lumos/snapshot', [\App\Http\Controllers\Employee\LumosController::class, 'storeSnapshot'])->name('lumos.snapshot.store');
    });

    // -- Employee Luxeast Routes --
    Route::middleware('role:employee_luxeast')->group(function() {
        Route::get('/luxeast/cashier', [\App\Http\Controllers\Employee\LuxeastController::class, 'cashier'])->name('luxeast.cashier');
        Route::post('/luxeast/transaction', [\App\Http\Controllers\Employee\LuxeastController::class, 'storeTransaction'])->name('luxeast.transaction.store');
    });
});

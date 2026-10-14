<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $role = null;
        $unit = null;
        $profile = null;
        $shiftStatus = null;

        if ($user) {
            $user->load('roles');
            $role = $user->roles->first();
            
            if ($user->employee) {
                $user->employee->load('profile', 'unit');
                $unit = $user->employee->unit;
                $profile = $user->employee->profile;

                $todayAttendance = \App\Models\Attendance::where('employee_id', $user->employee->id)
                    ->whereDate('date', date('Y-m-d'))
                    ->first();

                $shiftStatus = [
                    'is_active' => (bool) ($todayAttendance && $todayAttendance->check_in && !$todayAttendance->check_out),
                    'has_clocked_in' => (bool) ($todayAttendance && $todayAttendance->check_in),
                    'has_clocked_out' => (bool) ($todayAttendance && $todayAttendance->check_out),
                    'check_in_time' => $todayAttendance && $todayAttendance->check_in ? $todayAttendance->check_in->format('H:i') : null,
                    'check_out_time' => $todayAttendance && $todayAttendance->check_out ? $todayAttendance->check_out->format('H:i') : null,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'must_change_password' => $user->must_change_password
                ] : null,
                'role' => $role ? $role->slug : null,
                'unit' => $unit ? [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type
                ] : null,
                'profile' => $profile ? [
                    'full_name' => $profile->full_name
                ] : null,
                'shift_status' => $shiftStatus,
                'notifications' => $user ? $user->unreadNotifications()->take(5)->get() : [],
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'shift_lock' => fn () => $request->session()->get('shift_lock'),
            ],
        ];
    }
}

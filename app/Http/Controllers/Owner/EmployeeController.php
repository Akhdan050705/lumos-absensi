<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Employee;
use App\Models\BusinessUnit;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $employees = Employee::with(['user', 'unit'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        $units = BusinessUnit::all();

        return Inertia::render('Owner/EmployeeMaster', [
            'employees' => $employees,
            'units' => $units
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'unit_id' => 'required|exists:business_units,id',
            'employee_code' => 'required|string|unique:employees,employee_code',
        ]);

        DB::beginTransaction();
        try {
            // 1. Buat Akun User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // 2. Beri Role (1: Owner, 2: Lumos, 3: Luxeast)
            $roleId = ($request->unit_id == 1) ? 2 : 3;
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $roleId
            ]);

            // 3. Buat Profil Pegawai
            Employee::create([
                'user_id' => $user->id,
                'unit_id' => $request->unit_id,
                'employee_code' => $request->employee_code,
                'status' => 'active'
            ]);

            DB::commit();
            return redirect()->back()->with('message', 'Pegawai baru berhasil didaftarkan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['general' => 'Gagal menambah pegawai: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus(Request $request, $id)
    {
        if (!$request->user()->hasRole('owner')) abort(403);

        $employee = Employee::with('user')->findOrFail($id);
        
        $newStatus = $employee->status === 'active' ? 'inactive' : 'active';
        $employee->update(['status' => $newStatus]);

        if ($employee->user) {
            $employee->user->update([
                'is_active' => $newStatus === 'active' ? 1 : 0
            ]);
        }

        $msg = $newStatus === 'active' ? 'diaktifkan kembali' : 'dinonaktifkan (login diblokir)';
        return redirect()->back()->with('message', "Pegawai berhasil {$msg}.");
    }
}

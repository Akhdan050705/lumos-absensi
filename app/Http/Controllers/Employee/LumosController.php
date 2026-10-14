<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SalesSnapshot;
use App\Models\Shift;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LumosController extends Controller
{
    public function pos(Request $request)
    {
        $user = $request->user();
        if (!$user->employee || $user->employee->unit_id != 1) {
            abort(403, 'Akses ditolak. Anda bukan pegawai Lumos Vape Store.');
        }

        // Ambil data shift untuk unit Lumos (unit_id = 1)
        $shifts = Shift::where('unit_id', 1)->where('is_active', 1)->get();

        // Riwayat snapshot terakhir dari unit Lumos
        $history = SalesSnapshot::where('unit_id', 1)
            ->with(['employee.user', 'shift'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Lumos/Pos', [
            'shifts' => $shifts,
            'history' => $history
        ]);
    }

    public function storeSnapshot(Request $request)
    {
        $user = $request->user();
        if (!$user->employee || $user->employee->unit_id != 1) {
            abort(403, 'Akses ditolak. Anda bukan pegawai Lumos Vape Store.');
        }

        $request->validate([
            'shift_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('work_shifts', 'id')->where(function ($query) {
                    $query->where('unit_id', 1);
                })
            ],
            'type' => 'required|in:handover,closing',
            'pos_total' => 'required|numeric|min:0',
            'expected_cash' => 'required|numeric|min:0',
            'actual_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
        ]);

        $employeeId = $user->employee->id;
        
        // Variance: Selisih antara uang fisik aktual dengan uang yang seharusnya ada (expected)
        $variance = $request->actual_cash - $request->expected_cash;

        // Simpan foto bukti ke private storage (disk local)
        $photoPath = '';
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('snapshots', 'local');
        }

        SalesSnapshot::create([
            'unit_id' => 1,
            'employee_id' => $employeeId,
            'shift_id' => $request->shift_id,
            'type' => $request->type,
            'pos_total' => $request->pos_total,
            'expected_cash' => $request->expected_cash,
            'actual_cash' => $request->actual_cash,
            'variance' => $variance,
            'notes' => $request->notes,
            'photo_path' => $photoPath,
            'status' => 'submitted',
        ]);

        return redirect()->back()->with('message', 'Laporan / Rekonsiliasi Kas Lumos berhasil disubmit!');
    }
}
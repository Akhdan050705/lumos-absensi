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
        $shifts = Shift::where('unit_id', 1)->get();

        // Riwayat snapshot terakhir dari pegawai ini
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
        $request->validate([
            'shift_id' => 'required|exists:work_shifts,id',
            'type' => 'required|in:handover,closing',
            'pos_total' => 'required|numeric',
            'expected_cash' => 'required|numeric',
            'actual_cash' => 'required|numeric',
            'notes' => 'nullable|string',
            'photo' => 'required|image|max:5120', // Max 5MB
        ]);

        $user = $request->user();
        $employeeId = $user->employee->id;
        
        // Perbaikan: Hitung selisih uang (variance) sesuai logika baru
        $variance = $request->pos_total - ($request->expected_cash + $request->actual_cash);

        // Simpan foto bukti
        $photoPath = '';
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('snapshots', 'public');
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

        return redirect()->back()->with('message', 'Laporan / Rekonsiliasi Kas berhasil disubmit!');
    }
}
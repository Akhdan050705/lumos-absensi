import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function AttendanceRecap({ records, units, filters, summary }: any) {
    const [selectedPhoto, setSelectedPhoto] = useState<{ in?: string; out?: string; name: string; date: string } | null>(null);
    const [adjustingRecord, setAdjustingRecord] = useState<any | null>(null);
    const [waived, setWaived] = useState<boolean>(false);
    const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
    const [waivedReason, setWaivedReason] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);

    // Early leave approval state
    const [earlyLeaveRecord, setEarlyLeaveRecord] = useState<any | null>(null);
    const [earlyAction, setEarlyAction] = useState<'approve' | 'reject'>('approve');
    const [earlyPenalty, setEarlyPenalty] = useState<number>(0);
    const [earlyNotes, setEarlyNotes] = useState<string>('');

    // View mode state for filter
    const [viewMode, setViewMode] = useState<string>(filters.view_mode || 'daily');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const params: any = {
            view_mode: viewMode,
            unit_id: fd.get('unit_id'),
        };
        if (viewMode === 'daily') {
            params.date = fd.get('date');
        } else {
            params.month = fd.get('month');
            params.year = fd.get('year');
        }
        router.get('/owner/attendance-recap', params, { preserveState: true });
    };

    const openAdjustModal = (rec: any) => {
        setAdjustingRecord(rec);
        setWaived(rec.penalty_waived);
        setPenaltyAmount(rec.penalty_waived ? 0 : rec.penalty_amount);
        setWaivedReason(rec.waived_reason || '');
    };

    const saveAdjustment = async () => {
        if (!adjustingRecord) return;

        const isWaiving = waived;
        const ok = await swal.confirm(
            isWaiving ? 'Bebaskan Denda Keterlambatan?' : 'Simpan Penyesuaian Denda?',
            isWaiving
                ? `Denda untuk ${adjustingRecord.employee_name} akan diatur menjadi Rp 0 (Dimaafkan) dan tidak akan memotong gaji bulanan.`
                : `Denda untuk ${adjustingRecord.employee_name} akan ditetapkan sebesar Rp ${penaltyAmount.toLocaleString('id-ID')}.`,
            {
                confirmText: 'Ya, Simpan',
                confirmColor: isWaiving ? '#16a34a' : '#111827'
            }
        );

        if (!ok) return;

        setProcessing(true);
        router.patch(`/owner/attendance-recap/${adjustingRecord.id}/adjust-penalty`, {
            penalty_waived: waived ? 1 : 0,
            penalty_amount: waived ? 0 : penaltyAmount,
            waived_reason: waivedReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAdjustingRecord(null);
                setProcessing(false);
                swal.toast('Penyesuaian denda berhasil disimpan!');
            },
            onError: (err: any) => {
                setProcessing(false);
                const msg = Object.values(err)[0] as string || 'Gagal menyimpan penyesuaian.';
                swal.error('Gagal Menyimpan', msg);
            }
        });
    };

    const openEarlyLeaveModal = (rec: any) => {
        setEarlyLeaveRecord(rec);
        const isRejected = rec.early_leave_status === 'rejected';
        setEarlyAction(isRejected ? 'reject' : 'approve');
        setEarlyPenalty(rec.early_leave_penalty > 0 ? rec.early_leave_penalty : 25000);
        setEarlyNotes(rec.early_leave_approval_notes || '');
    };

    const saveEarlyLeaveDecision = async () => {
        if (!earlyLeaveRecord) return;

        const isApprove = earlyAction === 'approve';
        const ok = await swal.confirm(
            isApprove ? 'Setujui (ACC) Pulang Lebih Awal?' : 'Tolak & Kenakan Denda Pulang Cepat?',
            isApprove
                ? `Pulang cepat untuk ${earlyLeaveRecord.employee_name} akan disetujui tanpa denda (Rp 0).`
                : `Pulang cepat untuk ${earlyLeaveRecord.employee_name} ditolak dan dikenakan denda Rp ${earlyPenalty.toLocaleString('id-ID')}. Nominal ini akan memotong rekap gaji pegawai.`,
            {
                confirmText: isApprove ? 'Ya, Setujui (ACC)' : 'Ya, Tetapkan Denda',
                confirmColor: isApprove ? '#16a34a' : '#e11d48'
            }
        );

        if (!ok) return;

        setProcessing(true);
        router.patch(`/owner/attendance-recap/${earlyLeaveRecord.id}/confirm-early-leave`, {
            action: earlyAction,
            early_leave_penalty: isApprove ? 0 : earlyPenalty,
            approval_notes: earlyNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEarlyLeaveRecord(null);
                setProcessing(false);
                swal.toast(isApprove ? 'Pulang cepat berhasil disetujui (ACC)!' : 'Denda pulang cepat berhasil ditetapkan!');
            },
            onError: (err: any) => {
                setProcessing(false);
                const msg = Object.values(err)[0] as string || 'Gagal menyimpan keputusan pulang cepat.';
                swal.error('Gagal Menyimpan', msg);
            }
        });
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Rekap Absensi, Keterlambatan & Pulang Cepat</h2>}>
            <Head title="Rekap Absensi Pegawai" />

            <div className="py-8 space-y-6">

                {/* Filter Header */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <form onSubmit={handleFilter} className="flex flex-col lg:flex-row lg:items-end gap-4">
                        <div className="flex-1">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Rekap Kehadiran</h3>
                            <p className="text-xs text-gray-500">Pantau bukti selfie, jam kerja, keterlambatan, konfirmasi pulang cepat, dan kontrol denda pegawai.</p>
                            
                            {/* Mode switcher tabs */}
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('daily')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                                        viewMode === 'daily'
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Mode Harian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('monthly')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                                        viewMode === 'monthly'
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Mode Bulanan
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Bisnis</label>
                            <select name="unit_id" defaultValue={filters.unit_id} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                <option value="">Semua Unit</option>
                                {units.map((u: any) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        {viewMode === 'daily' ? (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Spesifik</label>
                                <input 
                                    type="date" 
                                    name="date" 
                                    defaultValue={filters.date} 
                                    className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bulan</label>
                                    <select name="month" defaultValue={filters.month} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                        {months.map((m, idx) => (
                                            <option key={idx + 1} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tahun</label>
                                    <input 
                                        type="number" 
                                        name="year" 
                                        defaultValue={filters.year} 
                                        min="2020" 
                                        max="2030" 
                                        className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="text-sm font-semibold bg-gray-900 hover:bg-black active:scale-[0.99] text-white px-5 py-2 rounded-xl transition shadow"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Hadir</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">{summary.total_present}</p>
                    </div>
                    <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Tepat Waktu</p>
                        <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.total_on_time}</p>
                    </div>
                    <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Terlambat</p>
                        <p className="text-2xl font-extrabold text-rose-700 mt-1">{summary.total_late}</p>
                    </div>
                    <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pulang Cepat</p>
                        <p className="text-2xl font-extrabold text-amber-800 mt-1">{summary.total_early_leave || 0}</p>
                    </div>
                    <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Denda Aktif</p>
                        <p className="text-lg font-bold text-rose-700 mt-1.5">Rp {summary.total_penalty.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Denda Dimaafkan</p>
                        <p className="text-2xl font-extrabold text-blue-700 mt-1">{summary.total_waived} <span className="text-xs font-normal text-gray-500">kasus</span></p>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Daftar Kehadiran Pegawai</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {viewMode === 'daily' ? `Tanggal: ${filters.date || 'Hari Ini'}` : `Bulan: ${months[(filters.month || 1) - 1]} ${filters.year}`} ({records.length} data ditemukan)
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Pegawai & Unit</th>
                                    <th className="px-4 py-3 text-left">Shift Kerja</th>
                                    <th className="px-4 py-3 text-center">Clock In (Masuk)</th>
                                    <th className="px-4 py-3 text-center">Clock Out (Pulang)</th>
                                    <th className="px-4 py-3 text-left">Status Kehadiran</th>
                                    <th className="px-4 py-3 text-left">Keterangan & Catatan</th>
                                    <th className="px-4 py-3 text-right">Denda (Telat / Pulang)</th>
                                    <th className="px-4 py-3 text-center">Aksi Owner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map((rec: any) => {
                                    const isLate = rec.late_minutes > 0;
                                    const isWaived = rec.penalty_waived;
                                    const isEarly = rec.early_leave_minutes > 0;
                                    const activeLatePenalty = isWaived ? 0 : rec.penalty_amount;
                                    const activeEarlyPenalty = (rec.early_leave_status === 'rejected') ? rec.early_leave_penalty : 0;
                                    const totalRowPenalty = activeLatePenalty + activeEarlyPenalty;

                                    return (
                                        <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Pegawai */}
                                            <td className="px-4 py-3 text-xs">
                                                <p className="font-bold text-gray-900">{rec.employee_name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="font-mono text-[11px] text-gray-500">{rec.employee_code}</span>
                                                    <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded font-medium">{rec.unit_name}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.date}</p>
                                            </td>

                                            {/* Shift */}
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                <p className="font-semibold text-gray-800">{rec.shift_name}</p>
                                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{rec.shift_start} - {rec.shift_end}</p>
                                            </td>

                                            {/* Clock In */}
                                            <td className="px-4 py-3 text-center text-xs">
                                                {rec.check_in ? (
                                                    <div>
                                                        <span className="font-mono font-semibold text-gray-900">{rec.check_in}</span>
                                                        {rec.photo_in ? (
                                                            <button
                                                                onClick={() => setSelectedPhoto({ in: rec.photo_in, out: rec.photo_out, name: rec.employee_name, date: rec.date })}
                                                                className="block mx-auto text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline mt-0.5"
                                                            >
                                                                Foto Masuk
                                                            </button>
                                                        ) : (
                                                            <span className="block text-[10px] text-gray-400">Tanpa foto</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>

                                            {/* Clock Out */}
                                            <td className="px-4 py-3 text-center text-xs">
                                                {rec.check_out ? (
                                                    <div>
                                                        <span className="font-mono font-semibold text-gray-900">{rec.check_out}</span>
                                                        {rec.photo_out ? (
                                                            <button
                                                                onClick={() => setSelectedPhoto({ in: rec.photo_in, out: rec.photo_out, name: rec.employee_name, date: rec.date })}
                                                                className="block mx-auto text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline mt-0.5"
                                                            >
                                                                Foto Pulang
                                                            </button>
                                                        ) : (
                                                            <span className="block text-[10px] text-gray-400">Tanpa foto</span>
                                                        )}
                                                        {isEarly && (
                                                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                                Cepat {rec.early_leave_minutes}m
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 text-[11px] rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                        Sedang Bekerja
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Kehadiran */}
                                            <td className="px-4 py-3 text-xs space-y-1">
                                                {/* Masuk Status */}
                                                <div>
                                                    {isLate ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Terlambat {rec.late_minutes}m
                                                        </span>
                                                    ) : rec.status === 'on_time' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Tepat Waktu
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                                                            {rec.status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Pulang Status */}
                                                {isEarly && (
                                                    <div>
                                                        {rec.early_leave_status === 'pending' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                ⏳ Pulang Cepat (Menunggu ACC)
                                                            </span>
                                                        )}
                                                        {rec.early_leave_status === 'approved' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                ✓ Pulang Cepat Di-ACC
                                                            </span>
                                                        )}
                                                        {rec.early_leave_status === 'rejected' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                ✕ Pulang Cepat Ditolak
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Keterangan & Catatan */}
                                            <td className="px-4 py-3 text-xs">
                                                <div className="max-w-xs space-y-1.5">
                                                    {/* Keterangan Telat */}
                                                    {isLate && (
                                                        <div>
                                                            <p className="font-semibold text-rose-800 text-[11px]">Alasan Telat: {rec.late_reason || '-'}</p>
                                                            {rec.late_notes && (
                                                                <p className="text-[10px] text-gray-500 italic">"{rec.late_notes}"</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Keterangan Pulang Cepat */}
                                                    {isEarly && (
                                                        <div className={isLate ? 'pt-1.5 border-t border-gray-100' : ''}>
                                                            <p className="font-semibold text-amber-800 text-[11px]">Alasan Pulang: {rec.early_leave_reason}</p>
                                                            {rec.early_leave_notes && (
                                                                <p className="text-[10px] text-gray-500 italic">"{rec.early_leave_notes}"</p>
                                                            )}
                                                            {rec.early_leave_approval_notes && (
                                                                <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Catatan Owner: {rec.early_leave_approval_notes}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {!isLate && !isEarly && (
                                                        <span className="text-gray-400 text-[11px] italic">Tidak ada catatan</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Denda */}
                                            <td className="px-4 py-3 text-xs text-right whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    {/* Late penalty */}
                                                    {isLate && (
                                                        <div>
                                                            {isWaived ? (
                                                                <div className="text-[11px]">
                                                                    <span className="line-through text-gray-400">Rp {rec.penalty_amount.toLocaleString('id-ID')}</span>
                                                                    <span className="block font-semibold text-emerald-700">Telat: Rp 0 (Dimaafkan)</span>
                                                                </div>
                                                            ) : (
                                                                <p className="text-rose-700 font-medium">Telat: Rp {rec.penalty_amount.toLocaleString('id-ID')}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Early leave penalty */}
                                                    {isEarly && (
                                                        <div>
                                                            {rec.early_leave_status === 'approved' && (
                                                                <p className="text-emerald-700 font-medium text-[11px]">Pulang: Rp 0 (Di-ACC)</p>
                                                            )}
                                                            {rec.early_leave_status === 'rejected' && (
                                                                <p className="text-rose-700 font-medium text-[11px]">Pulang: Rp {rec.early_leave_penalty.toLocaleString('id-ID')}</p>
                                                            )}
                                                            {rec.early_leave_status === 'pending' && (
                                                                <p className="text-amber-600 font-medium text-[11px]">Pulang: Belum di-ACC</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Total */}
                                                    <div className="pt-1 border-t border-gray-100 font-bold text-gray-900">
                                                        Total: Rp {totalRowPenalty.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Aksi Owner */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5 items-center">
                                                    {/* Button adjust late penalty */}
                                                    {isLate && (
                                                        <button
                                                            onClick={() => openAdjustModal(rec)}
                                                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition shadow-sm active:scale-95 w-full ${
                                                                isWaived 
                                                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200' 
                                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                            }`}
                                                        >
                                                            {isWaived ? 'Edit Denda Telat' : 'Sesuaikan Telat'}
                                                        </button>
                                                    )}

                                                    {/* Button confirm early leave */}
                                                    {isEarly && (
                                                        <button
                                                            onClick={() => openEarlyLeaveModal(rec)}
                                                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition shadow-sm active:scale-95 w-full ${
                                                                rec.early_leave_status === 'pending'
                                                                    ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                                                                    : rec.early_leave_status === 'approved'
                                                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                                            }`}
                                                        >
                                                            {rec.early_leave_status === 'pending' ? '⚡ Review Pulang Cepat' : 'Edit Status Pulang'}
                                                        </button>
                                                    )}

                                                    {!isLate && !isEarly && (
                                                        <span className="text-gray-300 text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-xs text-gray-400">
                                            Tidak ada data kehadiran untuk filter yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal Preview Foto Selfie */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Bukti Foto Absensi: {selectedPhoto.name}</h4>
                                <p className="text-xs text-gray-400">Tanggal: {selectedPhoto.date}</p>
                            </div>
                            <button onClick={() => setSelectedPhoto(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-700">Foto Masuk (Clock In)</p>
                                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-gray-200">
                                    {selectedPhoto.in ? (
                                        <img src={selectedPhoto.in} alt="Selfie Masuk" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-xs text-gray-400">Belum ada foto masuk</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-700">Foto Pulang (Clock Out)</p>
                                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-gray-200">
                                    {selectedPhoto.out ? (
                                        <img src={selectedPhoto.out} alt="Selfie Pulang" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-xs text-gray-400">Belum ada foto pulang</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right pt-2 border-t border-gray-100">
                            <button onClick={() => setSelectedPhoto(null)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-medium transition">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sesuaikan Denda Keterlambatan */}
            {adjustingRecord && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Penyesuaian Denda Keterlambatan</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{adjustingRecord.employee_name} ({adjustingRecord.unit_name})</p>
                            </div>
                            <button onClick={() => setAdjustingRecord(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
                        </div>

                        {/* Rincian Keterlambatan */}
                        <div className="bg-gray-50 rounded-xl p-3.5 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Jam Shift:</span>
                                <span className="font-semibold text-gray-800">{adjustingRecord.shift_start} s/d {adjustingRecord.shift_end}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Jam Masuk Aktual:</span>
                                <span className="font-mono font-bold text-rose-600">{adjustingRecord.check_in}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Waktu Keterlambatan:</span>
                                <span className="font-bold text-rose-700">{adjustingRecord.late_minutes} Menit</span>
                            </div>
                            {adjustingRecord.late_reason && (
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                    <p className="text-gray-500 font-medium">Alasan Karyawan:</p>
                                    <p className="font-semibold text-gray-900 mt-0.5">{adjustingRecord.late_reason}</p>
                                    {adjustingRecord.late_notes && (
                                        <p className="italic text-gray-600 mt-0.5">"{adjustingRecord.late_notes}"</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Form Keputusan Owner */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Keputusan Pembebasan Denda</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setWaived(false); setPenaltyAmount(adjustingRecord.penalty_amount || 50000); }}
                                        className={`p-3 rounded-xl border text-xs font-semibold transition text-left ${
                                            !waived 
                                                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm' 
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="font-bold">Kenakan Denda</div>
                                        <div className="text-[11px] font-normal mt-0.5 text-gray-500">Tetap potong gaji bulanan</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setWaived(true); setPenaltyAmount(0); }}
                                        className={`p-3 rounded-xl border text-xs font-semibold transition text-left ${
                                            waived 
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="font-bold">Bebaskan (Dimaafkan)</div>
                                        <div className="text-[11px] font-normal mt-0.5 text-gray-500">Denda Rp 0 (Tanpa potongan)</div>
                                    </button>
                                </div>
                            </div>

                            {!waived && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Nominal Denda (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="10000"
                                        value={penaltyAmount}
                                        onChange={e => setPenaltyAmount(Number(e.target.value))}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-bold text-gray-900"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">Standar denda sistem adalah Rp 50.000 per 30 menit keterlambatan.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan Pertimbangan Owner {waived && '(Wajib diisi)'}
                                </label>
                                <textarea
                                    value={waivedReason}
                                    onChange={e => setWaivedReason(e.target.value)}
                                    rows={2}
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder={waived ? "Contoh: Dimaafkan karena kendala macet / ban bocor sudah konfirmasi via WA." : "Keterangan opsional..."}
                                    required={waived}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setAdjustingRecord(null)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing || (waived && !waivedReason.trim())}
                                onClick={saveAdjustment}
                                className={`text-xs font-semibold text-white px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50 ${
                                    waived ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-900 hover:bg-black'
                                }`}
                            >
                                {processing ? 'Menyimpan...' : (waived ? 'Bebaskan Denda' : 'Simpan Denda')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Pulang Lebih Awal */}
            {earlyLeaveRecord && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Review & Konfirmasi Pulang Lebih Awal</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{earlyLeaveRecord.employee_name} ({earlyLeaveRecord.unit_name})</p>
                            </div>
                            <button onClick={() => setEarlyLeaveRecord(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
                        </div>

                        {/* Rincian Pulang Cepat */}
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jadwal Shift:</span>
                                <span className="font-semibold text-gray-800">{earlyLeaveRecord.shift_name} ({earlyLeaveRecord.shift_start} - {earlyLeaveRecord.shift_end})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jam Pulang Aktual:</span>
                                <span className="font-mono font-bold text-amber-900">{earlyLeaveRecord.check_out}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pulang Lebih Cepat:</span>
                                <span className="font-bold text-amber-700">{earlyLeaveRecord.early_leave_minutes} Menit</span>
                            </div>
                            <div className="pt-2 border-t border-amber-200/60 mt-2">
                                <p className="text-gray-600 font-medium">Alasan Karyawan Pulang Cepat:</p>
                                <p className="font-semibold text-gray-900 mt-0.5">{earlyLeaveRecord.early_leave_reason}</p>
                                {earlyLeaveRecord.early_leave_notes && (
                                    <p className="italic text-gray-600 mt-0.5">"{earlyLeaveRecord.early_leave_notes}"</p>
                                )}
                            </div>
                        </div>

                        {/* Form Keputusan Owner */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Pilihan Keputusan Owner</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setEarlyAction('approve'); setEarlyPenalty(0); }}
                                        className={`p-3 rounded-xl border text-xs font-semibold transition text-left ${
                                            earlyAction === 'approve' 
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>✓ Setujui (ACC)</span>
                                        </div>
                                        <div className="text-[11px] font-normal mt-0.5 text-gray-500">Bebas denda (Rp 0), alasan dapat diterima</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setEarlyAction('reject'); if (!earlyPenalty) setEarlyPenalty(25000); }}
                                        className={`p-3 rounded-xl border text-xs font-semibold transition text-left ${
                                            earlyAction === 'reject' 
                                                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm' 
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>✕ Tolak & Beri Denda</span>
                                        </div>
                                        <div className="text-[11px] font-normal mt-0.5 text-gray-500">Kenakan denda potongan gaji</div>
                                    </button>
                                </div>
                            </div>

                            {earlyAction === 'reject' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Nominal Denda Pulang Cepat (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="5000"
                                        value={earlyPenalty}
                                        onChange={e => setEarlyPenalty(Number(e.target.value))}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300 font-bold text-gray-900"
                                        placeholder="Contoh: 25000"
                                    />
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[11px] text-gray-500">Preset:</span>
                                        {[10000, 25000, 50000].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setEarlyPenalty(amt)}
                                                className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                                            >
                                                Rp {amt.toLocaleString('id-ID')}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-rose-600 mt-1">Denda ini akan otomatis memotong total gaji pegawai pada rekap payroll bulanan.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan Pertimbangan Owner (Opsional)
                                </label>
                                <textarea
                                    value={earlyNotes}
                                    onChange={e => setEarlyNotes(e.target.value)}
                                    rows={2}
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder={earlyAction === 'approve' ? "Contoh: Diizinkan karena ada urusan keluarga mendadak." : "Contoh: Dikenakan denda karena pulang tanpa izin darurat."}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setEarlyLeaveRecord(null)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={saveEarlyLeaveDecision}
                                className={`text-xs font-semibold text-white px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50 ${
                                    earlyAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {processing ? 'Menyimpan...' : (earlyAction === 'approve' ? 'Setujui (ACC Pulang)' : 'Simpan Denda Pulang')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

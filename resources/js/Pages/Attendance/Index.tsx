import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function Index({ shifts, todayAttendance, history, is_forced_full_shift, co_worker_name }: any) {
    const { auth } = usePage().props as any;
    const hasClockedIn = todayAttendance && todayAttendance.check_in;
    const hasClockedOut = todayAttendance && todayAttendance.check_out;

    const [selectedShift, setSelectedShift] = useState(shifts[0]?.id || '');

    const handleClockIn = () => {
        const targetShiftId = is_forced_full_shift ? (shifts[0]?.id || selectedShift) : selectedShift;
        if (!targetShiftId) {
            swal.error('Pilih Shift', 'Silakan pilih shift kerja terlebih dahulu sebelum melanjutkan presensi.');
            return;
        }
        window.location.href = `/attendance/camera?type=in&shift_id=${targetShiftId}`;
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800 leading-tight">Presensi Kehadiran</h2>}>
            <Head title="Presensi Harian" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Status & Action Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Catat Kehadiran Hari Ini</h3>
                                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Banner Otomatisasi Full Shift Jika Rekan Kerja Cuti */}
                        {is_forced_full_shift && (
                            <div className="mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Penugasan Otomatis: Full Shift (10:00 - 22:00)</h4>
                                        <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                                            Rekan kerja Anda <b>{co_worker_name || 'rekan kerja'}</b> sedang cuti/tidak masuk hari ini (telah disetujui Owner). Jadwal presensi Anda otomatis dialihkan ke <b>Full Shift (10:00 s/d 22:00)</b>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!hasClockedIn && (
                            <div className="max-w-md mb-5">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                    {is_forced_full_shift ? 'Shift Kerja Terpilih' : 'Pilih Shift Kerja'}
                                </label>
                                {is_forced_full_shift ? (
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 flex items-center justify-between">
                                        <span>{shifts[0]?.name} (10:00 - 22:00)</span>
                                        <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">Otomatis Terkunci</span>
                                    </div>
                                ) : (
                                    <select 
                                        value={selectedShift}
                                        onChange={(e) => setSelectedShift(e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    >
                                        {shifts.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {!hasClockedIn ? (
                                <button
                                    onClick={handleClockIn}
                                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-5 rounded-xl shadow transition text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                    Mulai Clock In (Masuk)
                                </button>
                            ) : !hasClockedOut ? (
                                <Link
                                    href={`/attendance/camera?type=out&shift_id=${todayAttendance.shift_id}`}
                                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-semibold py-2.5 px-5 rounded-xl shadow transition text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    Mulai Clock Out (Pulang)
                                </Link>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Anda telah menyelesaikan presensi masuk dan pulang untuk hari ini.
                                </div>
                            )}
                        </div>
                        
                        {todayAttendance && (
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-gray-500 font-medium">Clock In</p>
                                    <p className="font-semibold text-gray-900 mt-0.5">{todayAttendance.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-gray-500 font-medium">Clock Out</p>
                                    <p className="font-semibold text-gray-900 mt-0.5">{todayAttendance.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-gray-500 font-medium">Keterangan Terlambat</p>
                                    <p className={`font-semibold mt-0.5 ${todayAttendance.late_minutes > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {todayAttendance.late_minutes > 0 ? `Terlambat ${todayAttendance.late_minutes} Menit` : 'Tepat Waktu'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table Riwayat */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Riwayat Presensi Terbaru</h3>
                                <p className="text-xs text-gray-500">Catatan kehadiran 5 hari kerja terakhir</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3 text-left">Tanggal</th>
                                        <th className="px-6 py-3 text-left">Shift</th>
                                        <th className="px-6 py-3 text-left">Clock In</th>
                                        <th className="px-6 py-3 text-left">Clock Out</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {history.map((h: any) => (
                                        <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-900">{h.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{h.shift?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                                                {h.check_in ? new Date(h.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                                                {h.check_out ? new Date(h.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                                                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                                                    h.late_minutes > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {h.late_minutes > 0 ? `Telat ${h.late_minutes}m` : 'Tepat Waktu'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">Belum ada riwayat presensi tercatat.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function Report({ filter, summary, snapshots, barberDaily }: any) {
    const [activeTab, setActiveTab] = useState<'summary' | 'lumos' | 'luxeast'>('summary');
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const params: any = { month: fd.get('month'), year: fd.get('year') };
        const dateVal = fd.get('date') as string;
        if (dateVal) params.date = dateVal;
        router.get('/owner/reports', params, { preserveState: true });
    };

    const clearDate = () => {
        router.get('/owner/reports', { month: filter.month, year: filter.year }, { preserveState: true });
    };

    const handleVerify = async (id: number, status: 'verified' | 'rejected' | 'revision_requested' | 'locked') => {
        const labels: Record<string, { title: string, text: string, color: string }> = {
            verified: { title: 'Verifikasi Laporan Kas (ACC)?', text: 'Hitungan kas fisik dan sistem akan ditandai valid/benar.', color: '#16a34a' },
            revision_requested: { title: 'Minta Revisi Laporan?', text: 'Pegawai akan diminta menghitung ulang atau memperbaiki catatan selisih.', color: '#d97706' },
            rejected: { title: 'Tolak Laporan Kas?', text: 'Laporan kas akan ditolak dan pegawai akan menerima notifikasi.', color: '#dc2626' },
            locked: { title: 'Kunci Laporan Kas (Locked)?', text: 'Laporan akan dikunci permanen dan tidak dapat diedit atau direvisi lagi.', color: '#111827' },
        };

        const cfg = labels[status];
        const ok = await swal.confirm(cfg.title, cfg.text, {
            confirmText: 'Ya, Lanjutkan',
            confirmColor: cfg.color
        });

        if (ok) {
            router.patch(`/owner/reports/snapshot/${id}/verify`, { status }, { 
                preserveScroll: true,
                onSuccess: () => swal.toast(`Status laporan kas berhasil diperbarui!`),
                onError: (err: any) => swal.error('Gagal memperbarui', Object.values(err)[0] as string)
            });
        }
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const fmt = (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`;

    const statusConfig: Record<string, { label: string; cls: string }> = {
        draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
        submitted: { label: 'Menunggu ACC', cls: 'bg-blue-100 text-blue-700' },
        under_review: { label: 'Ditinjau', cls: 'bg-yellow-100 text-yellow-800' },
        revision_requested: { label: 'Minta Revisi', cls: 'bg-orange-100 text-orange-700' },
        verified: { label: 'Terverifikasi (ACC)', cls: 'bg-green-100 text-green-700' },
        rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
        locked: { label: 'Terkunci (Final)', cls: 'bg-gray-800 text-white' },
    };

    const tabs = [
        { key: 'summary', label: 'Ringkasan Bulanan' },
        { key: 'lumos', label: 'Laporan Kas Lumos' },
        { key: 'luxeast', label: 'Transaksi Luxeast' },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Laporan Keuangan & Rekonsiliasi Kas</h2>}>
            <Head title="Laporan" />
            <div className="py-8 space-y-6">

                {/* Filter */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Periode Laporan</p>
                            <p className="text-xs text-gray-500">Pilih bulan, tahun, atau filter ke tanggal spesifik untuk audit kas harian.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bulan</label>
                            <select name="month" defaultValue={filter.month} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tahun</label>
                            <input type="number" name="year" defaultValue={filter.year} className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Spesifik (Opsional)</label>
                            <input type="date" name="date" defaultValue={filter.date || ''} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="text-sm font-semibold bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl transition shadow">Terapkan</button>
                            {filter.date && (
                                <button type="button" onClick={clearDate} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">Reset Tanggal</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-2">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key as any)}
                                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                                    activeTab === t.key 
                                        ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab: Ringkasan */}
                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendapatan Lumos</p>
                                <p className="text-xs text-gray-400 mt-0.5">Vape Store (Total Closing Harian)</p>
                                <p className="text-2xl font-bold mt-3 text-blue-700">{fmt(summary.lumos_revenue)}</p>
                            </div>
                            <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendapatan Luxeast</p>
                                <p className="text-xs text-gray-400 mt-0.5">Barbershop (Transaksi Layanan)</p>
                                <p className="text-2xl font-bold mt-3 text-purple-700">{fmt(summary.luxeast_revenue)}</p>
                            </div>
                            <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pendapatan Kotor</p>
                                <p className="text-xs text-gray-400 mt-0.5">Semua unit bisnis</p>
                                <p className="text-2xl font-bold mt-3 text-gray-900">{fmt(summary.total_revenue)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Beban Gaji (Payroll)</p>
                                <p className="text-xs text-gray-400 mt-0.5">Dari generate payroll bulan ini</p>
                                <p className="text-2xl font-bold mt-3 text-red-600">- {fmt(summary.payroll_expense)}</p>
                            </div>
                            <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimasi Laba Bersih</p>
                                <p className="text-xs text-gray-400 mt-0.5">Pendapatan kotor dikurangi beban gaji</p>
                                <p className="text-2xl font-bold mt-3 text-green-700">{fmt(summary.net_profit)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Laporan Kas Lumos */}
                {activeTab === 'lumos' && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Laporan Kas Harian — Lumos</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {filter.date ? `Tanggal: ${filter.date}` : `${months[filter.month - 1]} ${filter.year}`}
                                    {' '} — {snapshots.length} laporan masuk
                                </p>
                            </div>
                        </div>
                        {snapshots.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-gray-400">
                                Tidak ada laporan kas untuk periode ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-4 py-3 text-left">Waktu</th>
                                            <th className="px-4 py-3 text-left">Pegawai</th>
                                            <th className="px-4 py-3 text-left">Tipe</th>
                                            <th className="px-4 py-3 text-right">Total POS</th>
                                            <th className="px-4 py-3 text-right">Kas Expected</th>
                                            <th className="px-4 py-3 text-right">Kas Fisik</th>
                                            <th className="px-4 py-3 text-right">Selisih</th>
                                            <th className="px-4 py-3 text-center">Bukti</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {snapshots.map((s: any) => {
                                            const variance = Number(s.variance);
                                            const st = statusConfig[s.status] || { label: s.status, cls: 'bg-gray-100 text-gray-600' };
                                            return (
                                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                                                        <div className="font-semibold">{new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                        <div className="text-gray-400 font-mono mt-0.5">{new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap font-medium">{s.employee?.user?.name || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                            s.type === 'closing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {s.type === 'closing' ? 'Closing Kas' : 'Serah Terima'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-900 text-right font-medium whitespace-nowrap">{fmt(s.pos_total)}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 text-right whitespace-nowrap">{fmt(s.expected_cash)}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-900 text-right font-medium whitespace-nowrap">{fmt(s.actual_cash)}</td>
                                                    <td className={`px-4 py-3 text-xs text-right font-bold whitespace-nowrap ${
                                                        variance < 0 ? 'text-red-600' : variance > 0 ? 'text-amber-600' : 'text-green-600'
                                                    }`}>
                                                        {variance === 0 ? 'Pas (Rp 0)' : (variance > 0 ? '+' : '') + fmt(variance)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        {s.photo_path ? (
                                                            <button
                                                                onClick={() => setPreviewPhoto(`/files/${s.photo_path}`)}
                                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                                                            >
                                                                Lihat Foto
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${st.cls}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        {s.status === 'locked' ? (
                                                            <span className="text-xs text-gray-400 italic">Terkunci (Final)</span>
                                                        ) : (
                                                            <div className="flex justify-end gap-1.5">
                                                                {s.status !== 'verified' && (
                                                                    <button
                                                                        onClick={() => handleVerify(s.id, 'verified')}
                                                                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-lg transition shadow-sm active:scale-95"
                                                                    >
                                                                        ACC
                                                                    </button>
                                                                )}
                                                                {s.status === 'verified' && (
                                                                    <button
                                                                        onClick={() => handleVerify(s.id, 'locked')}
                                                                        className="text-xs font-semibold text-white bg-gray-900 hover:bg-black px-2.5 py-1 rounded-lg transition shadow-sm active:scale-95"
                                                                    >
                                                                        Kunci
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleVerify(s.id, 'revision_requested')}
                                                                    className="text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition"
                                                                >
                                                                    Revisi
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerify(s.id, 'rejected')}
                                                                    className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Transaksi Luxeast */}
                {activeTab === 'luxeast' && (
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Transaksi Harian — Luxeast Barbershop</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {filter.date ? `Tanggal: ${filter.date}` : `${months[filter.month - 1]} ${filter.year}`}
                                    {' '} — {barberDaily.length} hari beroperasi
                                </p>
                            </div>
                            {barberDaily.length === 0 ? (
                                <div className="px-6 py-12 text-center text-sm text-gray-400">
                                    Tidak ada transaksi untuk periode ini.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {barberDaily.map((day: any) => (
                                        <DayAccordion key={day.date} day={day} fmt={fmt} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Foto Bukti */}
            {previewPhoto && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden p-4 space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900">Foto Bukti Penutupan Kas</h4>
                            <button onClick={() => setPreviewPhoto(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
                        </div>
                        <div className="max-h-[70vh] overflow-auto flex justify-center bg-gray-50 rounded-xl">
                            <img src={previewPhoto} alt="Bukti Kas" className="max-w-full h-auto object-contain rounded-lg" />
                        </div>
                        <div className="text-right">
                            <button onClick={() => setPreviewPhoto(null)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function DayAccordion({ day, fmt }: { day: any; fmt: (v: number) => string }) {
    const [expanded, setExpanded] = useState(false);
    const dateObj = new Date(day.date + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            >
                <div>
                    <p className="text-sm font-bold text-gray-900">{dateLabel}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{day.count} transaksi dicatat</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-purple-700">{fmt(day.total)}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-2.5 text-left font-medium">Waktu</th>
                                    <th className="px-4 py-2.5 text-left font-medium">Barber</th>
                                    <th className="px-4 py-2.5 text-left font-medium">Layanan</th>
                                    <th className="px-4 py-2.5 text-left font-medium">Pelanggan</th>
                                    <th className="px-4 py-2.5 text-left font-medium">Pembayaran</th>
                                    <th className="px-4 py-2.5 text-right font-medium">Harga</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {day.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="text-xs hover:bg-gray-50">
                                        <td className="px-4 py-2.5 text-gray-600 font-mono">{new Date(tx.transaction_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-4 py-2.5 text-gray-900 font-semibold">{tx.employee?.user?.name || '-'}</td>
                                        <td className="px-4 py-2.5 text-gray-700 font-medium">{tx.service?.name || '-'}</td>
                                        <td className="px-4 py-2.5 text-gray-600">{tx.customer_name || '-'}</td>
                                        <td className="px-4 py-2.5 text-gray-600">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">{tx.payment_method?.name || '-'}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-900 font-bold text-right">{fmt(tx.price_snapshot)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

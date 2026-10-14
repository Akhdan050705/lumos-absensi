import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Report({ filter, summary, snapshots, barberDaily }: any) {
    const [activeTab, setActiveTab] = useState<'summary' | 'lumos' | 'luxeast'>('summary');

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

    const handleVerify = (id: number, status: 'verified' | 'rejected' | 'revision_requested') => {
        const labels: Record<string, string> = { verified: 'memverifikasi', rejected: 'menolak', revision_requested: 'meminta revisi untuk' };
        if (confirm(`Apakah Anda yakin ingin ${labels[status]} laporan kas ini?`)) {
            router.patch(`/owner/reports/snapshot/${id}/verify`, { status }, { preserveScroll: true });
        }
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const fmt = (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`;

    const statusConfig: Record<string, { label: string; cls: string }> = {
        draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
        submitted: { label: 'Dikirim', cls: 'bg-blue-100 text-blue-700' },
        under_review: { label: 'Ditinjau', cls: 'bg-yellow-100 text-yellow-800' },
        revision_requested: { label: 'Minta Revisi', cls: 'bg-orange-100 text-orange-700' },
        verified: { label: 'Terverifikasi', cls: 'bg-green-100 text-green-700' },
        rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
        locked: { label: 'Terkunci', cls: 'bg-gray-200 text-gray-600' },
    };

    const tabs = [
        { key: 'summary', label: 'Ringkasan Bulanan' },
        { key: 'lumos', label: 'Laporan Kas Lumos' },
        { key: 'luxeast', label: 'Transaksi Luxeast' },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Laporan Keuangan</h2>}>
            <Head title="Laporan" />
            <div className="py-8 space-y-6">

                {/* Filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Periode</p>
                            <p className="text-sm text-gray-600">Pilih bulan, tahun, atau tanggal spesifik untuk melihat laporan kas.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Bulan</label>
                            <select name="month" defaultValue={filter.month} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tahun</label>
                            <input type="number" name="year" defaultValue={filter.year} className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal (Opsional)</label>
                            <input type="date" name="date" defaultValue={filter.date || ''} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition">Terapkan</button>
                            {filter.date && (
                                <button type="button" onClick={clearDate} className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">Reset Tanggal</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-1">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key as any)}
                                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                                    activeTab === t.key 
                                        ? 'border-indigo-600 text-indigo-600 bg-white' 
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
                            <div className="bg-white border border-blue-100 rounded-xl p-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendapatan Lumos</p>
                                <p className="text-xs text-gray-400 mt-0.5">Vape Store</p>
                                <p className="text-2xl font-bold mt-3 text-blue-700">{fmt(summary.lumos_revenue)}</p>
                            </div>
                            <div className="bg-white border border-purple-100 rounded-xl p-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendapatan Luxeast</p>
                                <p className="text-xs text-gray-400 mt-0.5">Barbershop</p>
                                <p className="text-2xl font-bold mt-3 text-purple-700">{fmt(summary.luxeast_revenue)}</p>
                            </div>
                            <div className="bg-white border border-indigo-200 rounded-xl p-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pendapatan Kotor</p>
                                <p className="text-xs text-gray-400 mt-0.5">Semua unit</p>
                                <p className="text-2xl font-bold mt-3 text-indigo-700">{fmt(summary.total_revenue)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white border border-red-100 rounded-xl p-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Beban Gaji (Payroll)</p>
                                <p className="text-xs text-gray-400 mt-0.5">Dari generate payroll bulan ini</p>
                                <p className="text-2xl font-bold mt-3 text-red-600">- {fmt(summary.payroll_expense)}</p>
                            </div>
                            <div className="bg-white border border-green-200 rounded-xl p-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimasi Laba Bersih</p>
                                <p className="text-xs text-gray-400 mt-0.5">Pendapatan kotor - beban gaji</p>
                                <p className="text-2xl font-bold mt-3 text-green-700">{fmt(summary.net_profit)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Laporan Kas Lumos */}
                {activeTab === 'lumos' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Laporan Kas Harian — Lumos</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {filter.date ? `Tanggal: ${filter.date}` : `${months[filter.month - 1]} ${filter.year}`}
                                    {' '} — {snapshots.length} laporan
                                </p>
                            </div>
                        </div>
                        {snapshots.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-gray-500">
                                Tidak ada laporan kas untuk periode ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pegawai</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total POS</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kas Diharapkan</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kas Aktual</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Selisih</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {snapshots.map((s: any) => {
                                            const variance = Number(s.variance);
                                            const st = statusConfig[s.status] || { label: s.status, cls: 'bg-gray-100 text-gray-600' };
                                            return (
                                                <tr key={s.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        <div className="text-xs text-gray-400">{new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{s.employee?.user?.name || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            s.type === 'closing' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {s.type === 'closing' ? 'Closing' : 'Serah Terima'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium whitespace-nowrap">{fmt(s.pos_total)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{fmt(s.expected_cash)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{fmt(s.actual_cash)}</td>
                                                    <td className={`px-4 py-3 text-sm text-right font-semibold whitespace-nowrap ${
                                                        variance < 0 ? 'text-red-600' : variance > 0 ? 'text-amber-600' : 'text-green-600'
                                                    }`}>
                                                        {variance === 0 ? 'Pas' : (variance > 0 ? '+' : '') + fmt(variance)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        {(s.status === 'submitted' || s.status === 'under_review' || s.status === 'draft') ? (
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleVerify(s.id, 'verified')}
                                                                    className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded transition"
                                                                >
                                                                    ACC
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerify(s.id, 'revision_requested')}
                                                                    className="text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded transition"
                                                                >
                                                                    Revisi
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerify(s.id, 'rejected')}
                                                                    className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Selesai</span>
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
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Transaksi Harian — Luxeast Barbershop</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {filter.date ? `Tanggal: ${filter.date}` : `${months[filter.month - 1]} ${filter.year}`}
                                    {' '} — {barberDaily.length} hari
                                </p>
                            </div>
                            {barberDaily.length === 0 ? (
                                <div className="px-6 py-12 text-center text-sm text-gray-500">
                                    Tidak ada transaksi untuk periode ini.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {barberDaily.map((day: any) => (
                                        <DayAccordion key={day.date} day={day} fmt={fmt} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
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
                    <p className="text-sm font-semibold text-gray-800">{dateLabel}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{day.count} transaksi</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-purple-700">{fmt(day.total)}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase">
                                <th className="px-6 py-2 text-left font-medium">Waktu</th>
                                <th className="px-6 py-2 text-left font-medium">Barber</th>
                                <th className="px-6 py-2 text-left font-medium">Layanan</th>
                                <th className="px-6 py-2 text-left font-medium">Pelanggan</th>
                                <th className="px-6 py-2 text-left font-medium">Pembayaran</th>
                                <th className="px-6 py-2 text-right font-medium">Harga</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {day.transactions.map((tx: any) => (
                                <tr key={tx.id} className="text-sm">
                                    <td className="px-6 py-2 text-gray-700">{new Date(tx.transaction_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-2 text-gray-900 font-medium">{tx.employee?.user?.name || '-'}</td>
                                    <td className="px-6 py-2 text-gray-700">{tx.service?.name || '-'}</td>
                                    <td className="px-6 py-2 text-gray-700">{tx.customer_name || '-'}</td>
                                    <td className="px-6 py-2 text-gray-700">{tx.payment_method?.name || '-'}</td>
                                    <td className="px-6 py-2 text-gray-900 font-medium text-right">{fmt(tx.price_snapshot)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Payroll({ units, periods }: any) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Generate payroll untuk periode ini? Data absensi dan komisi akan dikalkulasi otomatis.')) {
            post('/owner/payroll/generate');
        }
    };

    const monthName = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Penggajian</h2>}>
            <Head title="Penggajian" />
            <div className="py-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Generate Payroll Baru</p>
                            {errors.general && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{errors.general}</div>}
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit Bisnis</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" required>
                                        <option value="" disabled>Pilih unit...</option>
                                        {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Bulan</label>
                                        <select value={data.month} onChange={e => setData('month', Number(e.target.value))} className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tahun</label>
                                        <input type="number" value={data.year} onChange={e => setData('year', Number(e.target.value))} className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" min="2020" max="2030" />
                                    </div>
                                </div>
                                <button type="submit" disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
                                    {processing ? 'Memproses...' : 'Kalkulasi Payroll'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">Riwayat Periode Penggajian</p>
                                <span className="text-xs text-gray-400">{periods.length} periode</span>
                            </div>
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left">Periode</th>
                                        <th className="px-5 py-3 text-left">Unit</th>
                                        <th className="px-5 py-3 text-left">Tanggal</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {periods.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-800">{monthName(p.start_date)}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{p.unit?.name}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 font-mono">{p.start_date.split('T')[0]} – {p.end_date.split('T')[0]}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 uppercase">{p.status}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <a href={`/owner/payroll/${p.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline">Lihat Detail</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {periods.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada payroll yang digenerate.</td></tr>
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

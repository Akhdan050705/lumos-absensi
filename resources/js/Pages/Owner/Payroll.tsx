import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function Payroll({ units, periods }: any) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedUnit = units.find((u: any) => u.id == data.unit_id);
        const unitName = selectedUnit ? selectedUnit.name : 'Unit';

        const ok = await swal.confirm(
            'Kalkulasi Payroll Baru?',
            `Sistem akan mengkalkulasi gaji pokok, denda keterlambatan absensi (setelah penyesuaian/pembebasan), dan bagi hasil untuk ${unitName} periode ${months[data.month - 1]} ${data.year}.`,
            { confirmText: 'Ya, Kalkulasi', confirmColor: '#111827' }
        );

        if (ok) {
            post('/owner/payroll/generate', {
                preserveScroll: true,
                onSuccess: () => swal.toast('Draft Payroll baru berhasil dikalkulasi!'),
                onError: (err: any) => swal.error('Gagal kalkulasi payroll', Object.values(err)[0] as string)
            });
        }
    };

    const handleDelete = async (id: number, unitName: string, dateStr: string) => {
        const ok = await swal.confirmDanger(
            'Hapus Draft Payroll?',
            `Data kalkulasi penggajian ${unitName} (${monthName(dateStr)}) akan dihapus permanen dari sistem.`
        );

        if (ok) {
            router.delete(`/owner/payroll/${id}`, {
                preserveScroll: true,
                onSuccess: () => swal.toast('Draft penggajian berhasil dihapus!'),
                onError: (err: any) => swal.error('Gagal menghapus', Object.values(err)[0] as string)
            });
        }
    };

    const handleRevoke = async (id: number, unitName: string, dateStr: string) => {
        const ok = await swal.confirm(
            'Batalkan Persetujuan (ACC)?',
            `Status penggajian ${unitName} (${monthName(dateStr)}) akan dikembalikan ke Draft. Slip gaji tidak akan lagi bisa diakses oleh pegawai sampai disetujui kembali.`,
            { confirmText: 'Ya, Batalkan ACC', confirmColor: '#d97706', icon: 'warning' }
        );

        if (ok) {
            router.patch(`/owner/payroll/${id}/revoke`, {}, {
                preserveScroll: true,
                onSuccess: () => swal.toast('Persetujuan payroll berhasil dibatalkan!'),
                onError: (err: any) => swal.error('Gagal membatalkan ACC', Object.values(err)[0] as string)
            });
        }
    };

    const monthName = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Penggajian (Payroll)</h2>}>
            <Head title="Penggajian" />
            <div className="py-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Generate Payroll Baru</p>
                            {errors.general && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">{errors.general}</div>}
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Bisnis</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300" required>
                                        <option value="" disabled>Pilih unit...</option>
                                        {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bulan</label>
                                        <select value={data.month} onChange={e => setData('month', Number(e.target.value))} className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tahun</label>
                                        <input type="number" value={data.year} onChange={e => setData('year', Number(e.target.value))} className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={processing} className="w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition shadow disabled:opacity-50 mt-2">
                                    {processing ? 'Mengkalkulasi...' : 'Kalkulasi Payroll'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Riwayat Periode Penggajian</p>
                                    <p className="text-xs text-gray-400">Owner dapat membuat beberapa draft dan memilih salah satu untuk di-ACC.</p>
                                </div>
                                <span className="text-xs text-gray-400">{periods.length} periode</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-5 py-3 text-left">Periode</th>
                                            <th className="px-5 py-3 text-left">Unit</th>
                                            <th className="px-5 py-3 text-left">Rentang Tanggal</th>
                                            <th className="px-5 py-3 text-left">Status</th>
                                            <th className="px-5 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {periods.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{monthName(p.start_date)}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{p.unit?.name}</td>
                                                <td className="px-5 py-4 text-xs text-gray-500 font-mono">{p.start_date.split('T')[0]} – {p.end_date.split('T')[0]}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider ${
                                                        p.status === 'approved' || p.status === 'paid' 
                                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                                            : p.status === 'cancelled'
                                                                ? 'bg-gray-100 text-gray-500 line-through'
                                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    }`}>
                                                        {p.status === 'approved' ? 'Disetujui (ACC)' : p.status === 'draft' ? 'Draft' : p.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a href={`/owner/payroll/${p.id}`} className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl transition">
                                                            Lihat Detail
                                                        </a>
                                                        {p.status === 'draft' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(p.id, p.unit?.name, p.start_date)}
                                                                className="text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl transition"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                        {p.status === 'approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRevoke(p.id, p.unit?.name, p.start_date)}
                                                                className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl transition"
                                                            >
                                                                Batalkan ACC
                                                            </button>
                                                        )}
                                                    </div>
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
            </div>
        </AuthenticatedLayout>
    );
}

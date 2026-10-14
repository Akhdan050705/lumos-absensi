import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function Leave({ leaveTypes, history }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        leave_type_id: '', start_date: '', end_date: '', reason: '', attachment: null as File | null
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/leave', { 
            onSuccess: () => {
                reset();
                swal.toast('Pengajuan cuti/izin berhasil dikirim ke Owner!');
            },
            onError: (err: any) => {
                swal.error('Gagal mengirim pengajuan', Object.values(err)[0] as string);
            }
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const map: Record<string, { cls: string, label: string }> = {
            pending: { cls: 'bg-amber-100 text-amber-800', label: 'Menunggu' },
            approved: { cls: 'bg-green-100 text-green-800', label: 'Disetujui' },
            rejected: { cls: 'bg-red-100 text-red-800', label: 'Ditolak' },
        };
        const item = map[status] || { cls: 'bg-gray-100 text-gray-700', label: status };
        return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${item.cls}`}>{item.label}</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Pengajuan Cuti & Izin</h2>}>
            <Head title="Cuti & Izin" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-20">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                Form Pengajuan Izin
                            </h3>
                            <form onSubmit={submit} className="space-y-3.5" encType="multipart/form-data">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Cuti / Izin</label>
                                    <select value={data.leave_type_id} onChange={e => setData('leave_type_id', e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" required>
                                        <option value="" disabled>Pilih Jenis...</option>
                                        {leaveTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name} {t.is_paid ? '(Dibayar)' : '(Tanpa Gaji)'}</option>)}
                                    </select>
                                    <p className="text-[11px] text-gray-400 mt-1">Untuk kendala presensi (lupa check in/out, kendala teknis), ajukan melalui menu <b>Koreksi Absen</b>.</p>
                                    {errors.leave_type_id && <p className="text-red-500 text-xs mt-1">{errors.leave_type_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Mulai</label>
                                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Selesai</label>
                                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Alasan Lengkap</label>
                                    <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" rows={3} required placeholder="Jelaskan alasan izin Anda..." />
                                    {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Lampiran Bukti (Opsional)</label>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setData('attachment', e.target.files ? e.target.files[0] : null)} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition" />
                                </div>

                                <button type="submit" disabled={processing} className="w-full mt-2 bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-60 text-sm">
                                    {processing ? 'Mengirim...' : 'Kirim Pengajuan Izin'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Riwayat Pengajuan Saya</h3>
                                <span className="text-xs text-gray-400">{history.length} pengajuan</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 py-3 text-left">Diajukan</th>
                                            <th className="px-6 py-3 text-left">Jenis Izin</th>
                                            <th className="px-6 py-3 text-left">Durasi</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{req.leave_type?.name}</td>
                                                <td className="px-6 py-4 text-xs text-gray-600 font-mono">{req.start_date.split('T')[0]} → {req.end_date.split('T')[0]}</td>
                                                <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                            </tr>
                                        ))}
                                        {history.length === 0 && (
                                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">Belum pernah mengajukan cuti.</td></tr>
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

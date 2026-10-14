import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function ManualAttendance({ requests }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'in',
        request_date: '',
        request_time: '',
        reason: '',
        evidence: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/manual-attendance', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                swal.toast('Pengajuan koreksi absen berhasil dikirim ke Owner!');
            },
            onError: (err: any) => {
                swal.error('Gagal mengajukan koreksi', Object.values(err)[0] as string);
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Koreksi Absensi Manual</h2>}>
            <Head title="Koreksi Absensi" />
            <div className="py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Form Pengajuan */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Ajukan Koreksi Jam Absensi</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipe Absen</label>
                                    <select 
                                        value={data.type} 
                                        onChange={e => setData('type', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-300 outline-none"
                                    >
                                        <option value="in">Jam Masuk (Clock In)</option>
                                        <option value="out">Jam Keluar (Clock Out)</option>
                                        <option value="both">Keduanya (Masuk & Keluar)</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={data.request_date} 
                                        onChange={e => setData('request_date', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-300 outline-none"
                                        required 
                                    />
                                    {errors.request_date && <p className="text-red-500 text-xs mt-1">{errors.request_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Waktu Seharusnya (Jam:Menit)</label>
                                    <input 
                                        type="time" 
                                        value={data.request_time} 
                                        onChange={e => setData('request_time', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-300 outline-none"
                                        required 
                                    />
                                    {errors.request_time && <p className="text-red-500 text-xs mt-1">{errors.request_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Alasan Koreksi</label>
                                <textarea 
                                    value={data.reason} 
                                    onChange={e => setData('reason', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-300 outline-none"
                                    rows={2}
                                    placeholder="Jelaskan kendala: lupa absen pulang, HP mati, aplikasi error..."
                                    required 
                                />
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bukti Pendukung (Opsional)</label>
                                <input 
                                    type="file" 
                                    onChange={e => setData('evidence', e.target.files ? e.target.files[0] : null)} 
                                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                                {errors.evidence && <p className="text-red-500 text-xs mt-1">{errors.evidence}</p>}
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={processing} className="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition disabled:opacity-60">
                                    {processing ? 'Mengirim...' : 'Kirim Pengajuan Koreksi'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Riwayat Pengajuan */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Pengajuan Koreksi</h3>
                            <span className="text-xs text-gray-400">{requests.length} pengajuan</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-3 text-left">Tanggal & Waktu</th>
                                        <th className="px-6 py-3 text-left">Tipe</th>
                                        <th className="px-6 py-3 text-left">Alasan</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada riwayat pengajuan koreksi.</td>
                                        </tr>
                                    ) : (
                                        requests.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 font-mono">
                                                    <div className="font-semibold">{req.request_date}</div>
                                                    <div className="text-gray-400 mt-0.5">{req.request_time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                        {req.type === 'in' ? 'Masuk' : req.type === 'out' ? 'Keluar' : 'Masuk & Keluar'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate" title={req.reason}>
                                                    {req.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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

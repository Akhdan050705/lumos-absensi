import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

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
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Koreksi Absensi</h2>}>
            <Head title="Koreksi Absensi" />
            <div className="py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Form Pengajuan */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Ajukan Koreksi</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipe Absen</label>
                                    <select 
                                        value={data.type} 
                                        onChange={e => setData('type', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                                    >
                                        <option value="in">Jam Masuk (Clock In)</option>
                                        <option value="out">Jam Keluar (Clock Out)</option>
                                        <option value="both">Keduanya</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={data.request_date} 
                                        onChange={e => setData('request_date', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                                        required 
                                    />
                                    {errors.request_date && <p className="text-red-500 text-xs mt-1">{errors.request_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Waktu (Jam)</label>
                                    <input 
                                        type="time" 
                                        value={data.request_time} 
                                        onChange={e => setData('request_time', e.target.value)} 
                                        className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                                        required 
                                    />
                                    {errors.request_time && <p className="text-red-500 text-xs mt-1">{errors.request_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Alasan</label>
                                <textarea 
                                    value={data.reason} 
                                    onChange={e => setData('reason', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
                                    rows={2}
                                    placeholder="Contoh: Lupa absen pulang, Aplikasi error..."
                                    required 
                                />
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Bukti (Opsional)</label>
                                <input 
                                    type="file" 
                                    onChange={e => setData('evidence', e.target.files ? e.target.files[0] : null)} 
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {errors.evidence && <p className="text-red-500 text-xs mt-1">{errors.evidence}</p>}
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={processing} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60">
                                    {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Riwayat Pengajuan */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Riwayat Koreksi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada riwayat koreksi.</td>
                                        </tr>
                                    ) : (
                                        requests.map((req: any) => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="font-medium">{req.request_date}</div>
                                                    <div className="text-gray-500">{req.request_time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {req.type === 'in' ? 'Masuk' : req.type === 'out' ? 'Keluar' : 'Masuk & Keluar'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {req.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
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

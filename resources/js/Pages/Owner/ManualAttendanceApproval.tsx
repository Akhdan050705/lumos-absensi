import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function ManualAttendanceApproval({ requests }: any) {
    const handleAction = (id: number, status: 'approved' | 'rejected') => {
        if (confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan ini?`)) {
            router.patch(`/owner/manual-attendance/${id}`, { status }, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Persetujuan Koreksi Absen</h2>}>
            <Head title="Koreksi Absen" />
            <div className="py-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Daftar Pengajuan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pegawai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada pengajuan koreksi absen.</td>
                                        </tr>
                                    ) : (
                                        requests.map((req: any) => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{req.employee?.user?.name}</div>
                                                    <div className="text-xs text-gray-500">{req.employee?.unit?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {req.type === 'in' ? 'Masuk' : req.type === 'out' ? 'Keluar' : 'Masuk & Keluar'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="font-medium">{req.request_date}</div>
                                                    <div className="text-gray-500">{req.request_time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {req.reason}
                                                    {req.evidence_path && (
                                                        <a href={`/storage/${req.evidence_path}`} target="_blank" className="block text-indigo-600 mt-1 text-xs hover:underline">Lihat Bukti</a>
                                                    )}
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'approved')}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'rejected')}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Selesai</span>
                                                    )}
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

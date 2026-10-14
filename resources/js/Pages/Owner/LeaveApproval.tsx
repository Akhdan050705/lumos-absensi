import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${map[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

export default function LeaveApproval({ requests }: any) {
    const handleApproval = (id: number, status: string) => {
        if (confirm(`Anda yakin ingin ${status === 'approved' ? 'MENYETUJUI' : 'MENOLAK'} pengajuan ini?`)) {
            router.patch(`/owner/leaves/${id}`, { status });
        }
    };

    const pending = requests.filter((r: any) => r.status === 'pending');
    const done = requests.filter((r: any) => r.status !== 'pending');

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-gray-800"> Persetujuan Cuti & Izin</h2>}>
            <Head title="Persetujuan Cuti" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pending.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-2xl"></span>
                            <div>
                                <p className="font-bold text-amber-800">{pending.length} Pengajuan Menunggu Keputusan</p>
                                <p className="text-sm text-amber-600">Segera tinjau dan berikan keputusan.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Semua Pengajuan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3 text-left">Pegawai</th>
                                        <th className="px-6 py-3 text-left">Jenis Cuti</th>
                                        <th className="px-6 py-3 text-left">Tanggal Libur</th>
                                        <th className="px-6 py-3 text-left">Alasan</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.map((req: any) => (
                                        <tr key={req.id} className={`hover:bg-gray-50 transition-colors ${req.status === 'pending' ? 'bg-amber-50/50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-gray-900">{req.employee?.user?.name}</div>
                                                <div className="text-xs text-gray-400">{req.employee?.unit?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{req.leave_type?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{req.start_date.split('T')[0]}</div>
                                                <div className="text-xs text-gray-400">s/d {req.end_date.split('T')[0]}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                <p className="truncate" title={req.reason}>{req.reason}</p>
                                                {req.attachment_path && (
                                                    <a href={`/storage/${req.attachment_path}`} target="_blank" className="text-indigo-500 text-xs underline mt-1 block hover:text-indigo-700"> Lihat Lampiran</a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                            <td className="px-6 py-4 text-center">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleApproval(req.id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95"> Setuju</button>
                                                        <button onClick={() => handleApproval(req.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95"> Tolak</button>
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">Selesai</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <div className="text-4xl mb-2"></div>
                                            <p className="font-medium">Tidak ada pengajuan cuti saat ini.</p>
                                        </td></tr>
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

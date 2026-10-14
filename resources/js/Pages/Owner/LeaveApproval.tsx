import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import swal from '@/lib/swal';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { cls: string, label: string }> = {
        pending: { cls: 'bg-amber-100 text-amber-800', label: 'Menunggu' },
        approved: { cls: 'bg-green-100 text-green-800', label: 'Disetujui' },
        rejected: { cls: 'bg-red-100 text-red-800', label: 'Ditolak' },
    };
    const item = map[status] || { cls: 'bg-gray-100 text-gray-700', label: status };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${item.cls}`}>
            {item.label}
        </span>
    );
};

export default function LeaveApproval({ requests }: any) {
    const handleApproval = async (id: number, status: 'approved' | 'rejected', employeeName: string) => {
        const isApprove = status === 'approved';
        const ok = await swal.confirm(
            isApprove ? 'Setujui Pengajuan Cuti?' : 'Tolak Pengajuan Cuti?',
            isApprove 
                ? `Pengajuan cuti untuk ${employeeName} akan disetujui dan record absensi (leave/day_off) akan otomatis dibuat.`
                : `Pengajuan cuti untuk ${employeeName} akan ditolak.`,
            {
                confirmText: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
                confirmColor: isApprove ? '#16a34a' : '#dc2626',
                icon: isApprove ? 'question' : 'warning'
            }
        );

        if (ok) {
            router.patch(`/owner/leaves/${id}`, { status }, {
                onSuccess: () => swal.toast(`Pengajuan cuti berhasil ${isApprove ? 'disetujui' : 'ditolak'}!`),
                onError: (err: any) => swal.error('Gagal memproses pengajuan', Object.values(err)[0] as string)
            });
        }
    };

    const pending = requests.filter((r: any) => r.status === 'pending');

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Persetujuan Cuti & Izin</h2>}>
            <Head title="Persetujuan Cuti" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pending.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-amber-900 text-sm">{pending.length} Pengajuan Menunggu Keputusan</p>
                                <p className="text-xs text-amber-700 mt-0.5">Tinjau alasan dan lampiran sebelum memberikan persetujuan resmi.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Daftar Pengajuan Cuti</h3>
                            <span className="text-xs text-gray-400">{requests.length} pengajuan</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-3 text-left">Pegawai</th>
                                        <th className="px-6 py-3 text-left">Jenis Cuti</th>
                                        <th className="px-6 py-3 text-left">Tanggal</th>
                                        <th className="px-6 py-3 text-left">Alasan & Bukti</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.map((req: any) => (
                                        <tr key={req.id} className={`hover:bg-gray-50 transition-colors ${req.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-gray-900">{req.employee?.user?.name || '-'}</div>
                                                <div className="text-xs text-gray-400">{req.employee?.unit?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{req.leave_type?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="font-mono text-xs">{req.start_date.split('T')[0]}</div>
                                                <div className="text-xs text-gray-400 font-mono">s/d {req.end_date.split('T')[0]}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                <p className="line-clamp-2 text-xs" title={req.reason}>{req.reason}</p>
                                                {req.attachment_path && (
                                                    <a href={`/files/${req.attachment_path}`} target="_blank" className="text-indigo-600 text-xs font-medium underline mt-1.5 inline-block hover:text-indigo-800">
                                                        Lihat Lampiran Bukti
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleApproval(req.id, 'approved', req.employee?.user?.name || 'Pegawai')}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(req.id, 'rejected', req.employee?.user?.name || 'Pegawai')}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">Selesai</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                            Tidak ada pengajuan cuti saat ini.
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

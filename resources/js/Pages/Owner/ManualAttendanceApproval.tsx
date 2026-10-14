import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function ManualAttendanceApproval({ requests }: any) {
    const handleAction = async (id: number, status: 'approved' | 'rejected', empName: string, date: string) => {
        const isApprove = status === 'approved';
        const ok = await swal.confirm(
            isApprove ? 'Setujui Koreksi Absen?' : 'Tolak Koreksi Absen?',
            isApprove 
                ? `Pengajuan koreksi tanggal ${date} untuk ${empName} akan disetujui dan record absensi akan otomatis dibuat/diperbarui dengan perhitungan jam kerja yang tepat.`
                : `Pengajuan koreksi absen untuk ${empName} akan ditolak.`,
            {
                confirmText: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
                confirmColor: isApprove ? '#16a34a' : '#dc2626',
                icon: isApprove ? 'question' : 'warning'
            }
        );

        if (ok) {
            router.patch(`/owner/manual-attendance/${id}`, { status }, { 
                preserveScroll: true,
                onSuccess: () => swal.toast(`Koreksi absensi berhasil ${isApprove ? 'disetujui' : 'ditolak'}!`),
                onError: (err: any) => swal.error('Gagal memproses', Object.values(err)[0] as string)
            });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Persetujuan Koreksi Absen Manual</h2>}>
            <Head title="Koreksi Absen" />
            <div className="py-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Pengajuan Koreksi</h3>
                            <span className="text-xs text-gray-400">{requests.length} pengajuan</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pegawai</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alasan & Bukti</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Belum ada pengajuan koreksi absen.</td>
                                        </tr>
                                    ) : (
                                        requests.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{req.employee?.user?.name || '-'}</div>
                                                    <div className="text-xs text-gray-400">{req.employee?.unit?.name || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                        {req.type === 'in' ? 'Masuk' : req.type === 'out' ? 'Keluar' : 'Masuk & Keluar'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                    <div className="font-mono text-xs">{req.request_date}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{req.request_time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                                                    <p className="line-clamp-2" title={req.reason}>{req.reason}</p>
                                                    {req.evidence_path && (
                                                        <a href={`/files/${req.evidence_path}`} target="_blank" className="text-indigo-600 mt-1 inline-block text-xs font-medium underline hover:text-indigo-800">
                                                            Lihat Lampiran Bukti
                                                        </a>
                                                    )}
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'approved', req.employee?.user?.name || 'Pegawai', req.request_date)}
                                                                className="text-white bg-green-600 hover:bg-green-700 active:scale-95 px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'rejected', req.employee?.user?.name || 'Pegawai', req.request_date)}
                                                                className="text-white bg-red-600 hover:bg-red-700 active:scale-95 px-3 py-1.5 rounded-lg shadow-sm transition-all"
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

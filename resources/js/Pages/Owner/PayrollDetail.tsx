import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function PayrollDetail({ period }: any) {
    const monthName = new Date(period.start_date).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const fmtStart = period.start_date.split('T')[0];
    const fmtEnd = period.end_date.split('T')[0];

    const totalNetPay = period.calculations.reduce((acc: number, calc: any) => acc + Number(calc.net_pay), 0);

    const handleApprove = async () => {
        const ok = await swal.confirm(
            'Setujui & Rilis Payroll (ACC)?',
            `Anda akan menyetujui penggajian periode ${monthName} (${period.unit?.name}). Slip gaji akan resmi dirilis ke semua pegawai dan notifikasi akan dikirimkan.`,
            { confirmText: 'Ya, Setujui & Rilis', confirmColor: '#16a34a' }
        );

        if (ok) {
            router.patch(`/owner/payroll/${period.id}/approve`, {}, {
                preserveScroll: true,
                onSuccess: () => swal.toast('Payroll berhasil disetujui dan slip gaji resmi dirilis!'),
                onError: (err: any) => swal.error('Gagal menyetujui payroll', Object.values(err)[0] as string)
            });
        }
    };

    const handleRevoke = async () => {
        const ok = await swal.confirm(
            'Batalkan Persetujuan (ACC)?',
            `Persetujuan payroll periode ${monthName} akan dibatalkan dan status kembali ke Draft. Slip gaji tidak akan lagi bisa diakses oleh pegawai.`,
            { confirmText: 'Ya, Batalkan ACC', confirmColor: '#d97706', icon: 'warning' }
        );

        if (ok) {
            router.patch(`/owner/payroll/${period.id}/revoke`, {}, {
                preserveScroll: true,
                onSuccess: () => swal.toast('Persetujuan payroll dibatalkan. Status kembali ke Draft.'),
                onError: (err: any) => swal.error('Gagal membatalkan ACC', Object.values(err)[0] as string)
            });
        }
    };

    const handleDelete = async () => {
        const ok = await swal.confirmDanger(
            'Hapus Draft Payroll Ini?',
            `Kalkulasi payroll periode ${monthName} (${period.unit?.name}) akan dihapus permanen.`
        );

        if (ok) {
            router.delete(`/owner/payroll/${period.id}`, {
                onSuccess: () => {
                    swal.toast('Draft payroll berhasil dihapus!');
                    router.visit('/owner/payroll');
                },
                onError: (err: any) => swal.error('Gagal menghapus', Object.values(err)[0] as string)
            });
        }
    };

    const statusBadge = (status: string) => {
        if (status === 'approved' || status === 'paid') {
            return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold text-xs uppercase tracking-wider">Disetujui / Dirilis (ACC)</span>;
        }
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-semibold text-xs uppercase tracking-wider">Draft / Belum Di-ACC</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Detail Penggajian — {monthName}</h2>}>
            <Head title={`Detail Payroll - ${monthName}`} />

            <div className="py-8 space-y-6">
                
                {/* Header Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-bold text-gray-900">{period.unit.name}</h3>
                            {statusBadge(period.status)}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Periode Kerja: {fmtStart} s/d {fmtEnd}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Beban Gaji (Net)</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-0.5">Rp {totalNetPay.toLocaleString('id-ID')}</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            {period.status === 'draft' && (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition shadow-sm active:scale-95"
                                    >
                                        Hapus Draft
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                        Setujui & Rilis (ACC)
                                    </button>
                                </>
                            )}

                            {period.status === 'approved' && (
                                <button
                                    onClick={handleRevoke}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95"
                                >
                                    Batalkan ACC (Revoke)
                                </button>
                            )}

                            <a
                                href="/owner/payroll"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition"
                            >
                                Kembali
                            </a>
                        </div>
                    </div>
                </div>

                {/* Table Calculations */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3">Rincian Per Pegawai</h3>
                    
                    <div className="space-y-4">
                        {period.calculations.map((calc: any) => (
                            <div key={calc.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900">{calc.employee?.user?.name || `Pegawai #${calc.employee_id}`}</h4>
                                        <p className="text-xs text-gray-400">Kode: {calc.employee?.employee_code || '-'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 font-medium">Take Home Pay:</span>
                                        <span className="ml-2 text-lg font-bold text-emerald-700">Rp {Number(calc.net_pay).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Komponen Rincian</h5>
                                    <ul className="space-y-1.5">
                                        {calc.details.map((detail: any) => (
                                            <li key={detail.id} className="flex justify-between text-xs font-medium">
                                                <span className="text-gray-700">{detail.description}</span>
                                                <span className={detail.type === 'earning' ? 'text-blue-700 font-semibold' : 'text-rose-600 font-semibold'}>
                                                    {detail.type === 'earning' ? '+' : '-'} Rp {Number(detail.amount).toLocaleString('id-ID')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="mt-3 text-xs flex gap-6 text-gray-600 border-t border-gray-100 pt-2.5">
                                    <div>Gross Pay: <span className="font-semibold text-gray-900">Rp {Number(calc.gross_pay).toLocaleString('id-ID')}</span></div>
                                    <div>Total Potongan: <span className="font-semibold text-rose-600">Rp {Number(calc.total_deductions).toLocaleString('id-ID')}</span></div>
                                </div>
                            </div>
                        ))}

                        {period.calculations.length === 0 && (
                            <div className="text-center text-gray-400 py-8 text-sm">Belum ada rincian data pegawai.</div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

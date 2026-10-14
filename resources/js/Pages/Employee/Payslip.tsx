import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { cls: string, label: string }> = {
        draft: { cls: 'bg-gray-100 text-gray-700', label: 'Draft' },
        approved: { cls: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Disetujui' },
        paid: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Dibayar' },
    };
    const item = map[status] || { cls: 'bg-gray-100 text-gray-700', label: status };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${item.cls}`}>{item.label}</span>;
};

export default function Payslip({ payslips, employee }: any) {
    const [selected, setSelected] = useState<any>(payslips[0] || null);

    const earnings = selected ? selected.details.filter((d: any) => d.type === 'earning') : [];
    const deductions = selected ? selected.details.filter((d: any) => d.type === 'deduction') : [];

    const periodLabel = (p: any) => {
        const d = new Date(p.period.start_date);
        return d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Slip Gaji Pegawai</h2>}>
            <Head title="Slip Gaji" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Daftar Slip Gaji */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Riwayat Penggajian</h3>
                                <p className="text-xs text-gray-500">Pilih periode untuk melihat rincian</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {payslips.map((slip: any) => (
                                    <button
                                        key={slip.id}
                                        onClick={() => setSelected(slip)}
                                        className={`w-full text-left px-5 py-4 transition-colors hover:bg-gray-50 ${selected?.id === slip.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''}`}
                                    >
                                        <div className="font-semibold text-sm text-gray-900">{periodLabel(slip)}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{slip.period?.unit?.name}</div>
                                        <div className="font-bold text-indigo-700 text-sm mt-1.5">Rp {Number(slip.net_pay).toLocaleString('id-ID')}</div>
                                    </button>
                                ))}
                                {payslips.length === 0 && (
                                    <div className="px-5 py-12 text-center text-gray-400 text-xs">
                                        Belum ada slip gaji resmi yang diterbitkan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail Slip Gaji */}
                    <div className="flex-1">
                        {selected ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Header Slip */}
                                <div className="bg-slate-900 border-b border-slate-800 px-8 py-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Slip Gaji Resmi</p>
                                            <h3 className="text-2xl font-extrabold text-white mt-1">{periodLabel(selected)}</h3>
                                            <p className="text-gray-300 text-sm mt-1">{selected.period?.unit?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={selected.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Pegawai */}
                                <div className="px-8 py-5 bg-gray-50/80 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-wider font-semibold">Nama Pegawai</p>
                                        <p className="font-bold text-gray-900 text-sm mt-0.5">{employee.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-wider font-semibold">Kode Pegawai</p>
                                        <p className="font-mono font-bold text-indigo-600 text-sm mt-0.5">{employee.employee_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-wider font-semibold">Periode</p>
                                        <p className="font-semibold text-gray-900 text-sm mt-0.5">{selected.period?.start_date?.split('T')[0]} s/d {selected.period?.end_date?.split('T')[0]}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-wider font-semibold">Unit Kerja</p>
                                        <p className="font-semibold text-gray-900 text-sm mt-0.5">{employee.unit?.name}</p>
                                    </div>
                                </div>

                                <div className="px-8 py-6 grid md:grid-cols-2 gap-8">
                                    {/* Pendapatan */}
                                    <div>
                                        <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">+</span>
                                            Komponen Pendapatan
                                        </h4>
                                        <div className="space-y-2.5">
                                            {earnings.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-xs py-2 border-b border-gray-100">
                                                    <span className="text-gray-700 font-medium">{item.description}</span>
                                                    <span className="font-semibold text-emerald-700">+ Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-200">
                                                <span className="text-gray-900">Total Pendapatan Kotor</span>
                                                <span className="text-emerald-700">Rp {Number(selected.gross_pay).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Potongan */}
                                    <div>
                                        <h4 className="font-bold text-rose-600 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">-</span>
                                            Komponen Potongan
                                        </h4>
                                        <div className="space-y-2.5">
                                            {deductions.length > 0 ? deductions.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-xs py-2 border-b border-gray-100">
                                                    <span className="text-gray-700 font-medium">{item.description}</span>
                                                    <span className="font-semibold text-rose-600">- Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                                </div>
                                            )) : (
                                                <div className="text-xs text-gray-400 italic py-2">Tidak ada potongan tercatat.</div>
                                            )}
                                            <div className="flex justify-between text-xs font-bold pt-2 border-t border-gray-200">
                                                <span className="text-gray-900">Total Potongan</span>
                                                <span className="text-rose-600">Rp {Number(selected.total_deductions).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Take Home Pay */}
                                <div className="mx-8 mb-8 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Take Home Pay (Gaji Bersih)</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Total pendapatan yang dibayarkan ke rekening pegawai</p>
                                        </div>
                                        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-800">Rp {Number(selected.net_pay).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center text-gray-400">
                                <p className="text-sm font-medium">Pilih periode slip gaji di sebelah kiri untuk melihat rincian.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        approved: 'bg-blue-100 text-blue-700',
        paid: 'bg-green-100 text-green-800',
    };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
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
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-gray-800"> Slip Gaji Saya</h2>}>
            <Head title="Slip Gaji" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Daftar Slip Gaji */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 text-sm">Riwayat Gaji</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {payslips.map((slip: any) => (
                                    <button
                                        key={slip.id}
                                        onClick={() => setSelected(slip)}
                                        className={`w-full text-left px-5 py-4 transition-colors hover:bg-gray-50 ${selected?.id === slip.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                                    >
                                        <div className="font-semibold text-sm text-gray-800">{periodLabel(slip)}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{slip.period?.unit?.name}</div>
                                        <div className="font-bold text-indigo-600 text-sm mt-1">Rp {Number(slip.net_pay).toLocaleString('id-ID')}</div>
                                    </button>
                                ))}
                                {payslips.length === 0 && (
                                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                        <div className="text-3xl mb-2"></div>
                                        <p>Belum ada slip gaji.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail Slip Gaji */}
                    <div className="flex-1">
                        {selected ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header Slip */}
                                <div className="bg-gray-50 border border-gray-200 px-8 py-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Slip Gaji Resmi</p>
                                            <h3 className="text-2xl font-extrabold mt-1">{periodLabel(selected)}</h3>
                                            <p className="text-indigo-200 text-sm mt-1">{selected.period?.unit?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={selected.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Pegawai */}
                                <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nama Pegawai</p>
                                        <p className="font-bold text-gray-800 mt-0.5">{employee.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Kode Pegawai</p>
                                        <p className="font-mono font-bold text-indigo-600 mt-0.5">{employee.employee_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Periode</p>
                                        <p className="font-semibold text-gray-800 mt-0.5">{selected.period?.start_date?.split('T')[0]} s/d {selected.period?.end_date?.split('T')[0]}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Unit Kerja</p>
                                        <p className="font-semibold text-gray-800 mt-0.5">{employee.unit?.name}</p>
                                    </div>
                                </div>

                                <div className="px-8 py-6 grid md:grid-cols-2 gap-6">
                                    {/* Pendapatan */}
                                    <div>
                                        <h4 className="font-bold text-green-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">↑</span>
                                            Pendapatan
                                        </h4>
                                        <div className="space-y-2">
                                            {earnings.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50">
                                                    <span className="text-gray-700">{item.description}</span>
                                                    <span className="font-semibold text-green-700">+ Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-sm font-bold pt-1">
                                                <span>Total Pendapatan Kotor</span>
                                                <span className="text-green-700">Rp {Number(selected.gross_pay).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Potongan */}
                                    <div>
                                        <h4 className="font-bold text-red-600 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">↓</span>
                                            Potongan
                                        </h4>
                                        <div className="space-y-2">
                                            {deductions.length > 0 ? deductions.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50">
                                                    <span className="text-gray-700">{item.description}</span>
                                                    <span className="font-semibold text-red-600">- Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                                </div>
                                            )) : (
                                                <div className="text-sm text-gray-400 italic py-2">Tidak ada potongan </div>
                                            )}
                                            <div className="flex justify-between text-sm font-bold pt-1">
                                                <span>Total Potongan</span>
                                                <span className="text-red-600">Rp {Number(selected.total_deductions).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Take Home Pay */}
                                <div className="mx-8 mb-8 rounded-2xl bg-gray-50 border border-gray-200 border border-indigo-100 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Take Home Pay (Gaji Bersih)</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Diterima oleh pegawai setelah potongan</p>
                                        </div>
                                        <p className="text-3xl font-extrabold text-indigo-700">Rp {Number(selected.net_pay).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-400">
                                <div className="text-5xl mb-4"></div>
                                <p className="font-semibold">Pilih periode slip gaji di sebelah kiri untuk melihat detailnya.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

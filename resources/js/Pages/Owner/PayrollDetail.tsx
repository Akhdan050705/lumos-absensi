import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function PayrollDetail({ period }: any) {
    const { auth } = usePage().props as any;

    const monthName = new Date(period.start_date).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const fmtStart = period.start_date.split('T')[0];
    const fmtEnd = period.end_date.split('T')[0];

    const totalNetPay = period.calculations.reduce((acc: number, calc: any) => acc + Number(calc.net_pay), 0);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Detail Penggajian - {monthName}</h2>}>
            <Head title={`Detail Payroll - ${monthName}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col gap-6">
                    
                    {/* Header Info */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">{period.unit.name}</h3>
                            <p className="text-gray-600 text-sm">Periode: {fmtStart} s/d {fmtEnd}</p>
                            <p className="text-gray-600 text-sm mt-1">Status: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-xs uppercase">{period.status}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600 text-sm">Total Pembayaran Gaji (Net)</p>
                            <h2 className="text-3xl font-bold text-green-600">Rp {totalNetPay.toLocaleString('id-ID')}</h2>
                        </div>
                    </div>

                    {/* Table Calculations */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Rincian Per Pegawai</h3>
                        
                        <div className="space-y-6">
                            {period.calculations.map((calc: any) => (
                                <div key={calc.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-lg font-bold text-gray-800">{calc.employee?.user?.name || `Pegawai #${calc.employee_id}`}</h4>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500">Take Home Pay:</span>
                                            <span className="ml-2 text-xl font-bold text-green-600">Rp {Number(calc.net_pay).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded p-3">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Komponen Gaji</h5>
                                        <ul className="space-y-1">
                                            {calc.details.map((detail: any) => (
                                                <li key={detail.id} className="flex justify-between text-sm">
                                                    <span>{detail.description}</span>
                                                    <span className={detail.type === 'earning' ? 'text-blue-600' : 'text-red-600'}>
                                                        {detail.type === 'earning' ? '+' : '-'} Rp {Number(detail.amount).toLocaleString('id-ID')}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="mt-3 text-sm flex gap-4">
                                        <div><span className="text-gray-500">Gross Pay:</span> <span className="font-semibold">Rp {Number(calc.gross_pay).toLocaleString('id-ID')}</span></div>
                                        <div><span className="text-gray-500">Total Potongan:</span> <span className="font-semibold text-red-600">Rp {Number(calc.total_deductions).toLocaleString('id-ID')}</span></div>
                                    </div>
                                </div>
                            ))}

                            {period.calculations.length === 0 && (
                                <div className="text-center text-gray-500 py-4">Belum ada data perhitungan pegawai.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

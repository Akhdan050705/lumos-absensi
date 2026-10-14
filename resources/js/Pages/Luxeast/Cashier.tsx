import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Cashier({ services, paymentMethods, barbers, todayTransactions }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: '', service_id: '', payment_method_id: '', customer_name: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/luxeast/transaction', { onSuccess: () => reset() });
    };

    const totalRevenue = todayTransactions.reduce((acc: number, curr: any) => acc + Number(curr.price_snapshot), 0);

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-gray-800">️ Kasir Luxeast Barbershop</h2>}>
            <Head title="Kasir Luxeast" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Form */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">️</span>
                                Catat Transaksi Baru
                            </h3>
                            <form onSubmit={submit} className="space-y-4">
                                {[
                                    { label: 'Barber (Kapster)', key: 'employee_id', opts: barbers, labelKey: 'name' },
                                    { label: 'Layanan', key: 'service_id', opts: services.map((s: any) => ({ id: s.id, name: `${s.name} — Rp ${Number(s.price).toLocaleString('id-ID')}` })), labelKey: 'name' },
                                    { label: 'Metode Pembayaran', key: 'payment_method_id', opts: paymentMethods, labelKey: 'name' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{f.label}</label>
                                        <select value={(data as any)[f.key]} onChange={e => setData(f.key as any, e.target.value)} className="block w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-300 outline-none transition" required>
                                            <option value="" disabled>Pilih...</option>
                                            {f.opts.map((o: any) => <option key={o.id} value={o.id}>{o[f.labelKey]}</option>)}
                                        </select>
                                        {(errors as any)[f.key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[f.key]}</p>}
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Nama Pelanggan (Opsional)</label>
                                    <input type="text" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} className="block w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-300 outline-none transition" placeholder="Tulis nama atau kosongkan" />
                                </div>
                                <button type="submit" disabled={processing} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-60">
                                    {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 space-y-4">
                        {/* Summary Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-white shadow">
                                <p className="text-xs font-semibold uppercase opacity-75">Total Transaksi Hari Ini</p>
                                <p className="text-3xl font-extrabold mt-1">{todayTransactions.length}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-white shadow">
                                <p className="text-xs font-semibold uppercase opacity-75">Total Pendapatan</p>
                                <p className="text-xl font-extrabold mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800">Riwayat Transaksi Hari Ini</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Waktu</th>
                                            <th className="px-6 py-3 text-left">Pelanggan</th>
                                            <th className="px-6 py-3 text-left">Barber</th>
                                            <th className="px-6 py-3 text-left">Layanan</th>
                                            <th className="px-6 py-3 text-right">Nominal</th>
                                            <th className="px-6 py-3 text-left">Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {todayTransactions.map((tx: any) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.transaction_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{tx.customer_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{tx.employee?.user?.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{tx.service?.name}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-700 text-right">Rp {Number(tx.price_snapshot).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{tx.payment_method?.name}</td>
                                            </tr>
                                        ))}
                                        {todayTransactions.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada transaksi hari ini. Yuk mulai!</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

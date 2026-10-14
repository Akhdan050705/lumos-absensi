import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function Cashier({ services, paymentMethods, barbers, todayTransactions }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: '',
        service_id: '',
        payment_method_id: '',
        customer_name: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/luxeast/transaction', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                swal.toast('Transaksi Berhasil!', 'Data kasir telah dicatat ke sistem.');
            },
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || 'Periksa kembali formulir transaksi Anda.';
                swal.error('Gagal Menyimpan', msg);
            }
        });
    };

    const totalRevenue = todayTransactions.reduce((acc: number, curr: any) => acc + Number(curr.price_snapshot), 0);

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Kasir Layanan Barbershop (Luxeast)</h2>}>
            <Head title="Kasir Luxeast" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Form Kasir */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.936 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.543 12l-3.936 0" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Catat Transaksi</h3>
                                    <p className="text-xs text-gray-500">Pilih barber dan layanan</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Barber / Kapster</label>
                                    <select
                                        value={data.employee_id}
                                        onChange={e => setData('employee_id', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        required
                                    >
                                        <option value="" disabled>Pilih Barber...</option>
                                        {barbers.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.employee_id && <p className="text-rose-600 text-xs mt-1">{errors.employee_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Layanan Potong / Grooming</label>
                                    <select
                                        value={data.service_id}
                                        onChange={e => setData('service_id', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        required
                                    >
                                        <option value="" disabled>Pilih Layanan...</option>
                                        {services.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} — Rp {Number(s.price).toLocaleString('id-ID')}</option>
                                        ))}
                                    </select>
                                    {errors.service_id && <p className="text-rose-600 text-xs mt-1">{errors.service_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Metode Pembayaran</label>
                                    <select
                                        value={data.payment_method_id}
                                        onChange={e => setData('payment_method_id', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        required
                                    >
                                        <option value="" disabled>Pilih Metode...</option>
                                        {paymentMethods.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {errors.payment_method_id && <p className="text-rose-600 text-xs mt-1">{errors.payment_method_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Nama Pelanggan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        placeholder="Pelanggan Umum"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-2 bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-50 text-sm"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table & Statistik */}
                    <div className="flex-1 space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transaksi Hari Ini</p>
                                <p className="text-3xl font-extrabold text-gray-900 mt-1">{todayTransactions.length}</p>
                            </div>
                            <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pendapatan Hari Ini</p>
                                <p className="text-2xl font-extrabold text-purple-700 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Riwayat Transaksi Hari Ini</h3>
                                    <p className="text-xs text-gray-500">Daftar transaksi kasir yang selesai diproses</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
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
                                    <tbody className="divide-y divide-gray-100">
                                        {todayTransactions.map((tx: any) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                                    {new Date(tx.transaction_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-900">{tx.customer_name || 'Pelanggan Umum'}</td>
                                                <td className="px-6 py-4 text-xs text-gray-700 font-medium">{tx.employee?.user?.name || '-'}</td>
                                                <td className="px-6 py-4 text-xs text-gray-700">{tx.service?.name || '-'}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-emerald-700 text-right">
                                                    Rp {Number(tx.price_snapshot).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-600">
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                                                        {tx.payment_method?.name || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {todayTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs">
                                                    Belum ada transaksi hari ini.
                                                </td>
                                            </tr>
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

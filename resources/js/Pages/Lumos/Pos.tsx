import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Pos({ shifts, history }: any) {
    const { auth } = usePage().props as any;

    const { data, setData, post, processing, reset, errors } = useForm({
        shift_id: '',
        type: 'closing',
        pos_total: '',
        expected_cash: '',
        actual_cash: '',
        notes: '',
        photo: null as File | null
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lumos/snapshot', {
            onSuccess: () => reset(),
        });
    };

    // Helper untuk memformat angka ke tampilan mata uang (Rp. 100.000)
    const formatRupiah = (value: string | number) => {
        if (!value) return '';
        const rawValue = value.toString().replace(/[^0-9]/g, '');
        if (!rawValue) return '';
        return 'Rp ' + Number(rawValue).toLocaleString('id-ID');
    };

    // Helper untuk menangani perubahan input form, hanya menyimpan angka
    const handleCurrencyChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setData(field, rawValue);
    };

    const calculateVariance = () => {
        const posTotal = Number(data.pos_total) || 0;
        const nonTunai = Number(data.expected_cash) || 0;
        const actualCash = Number(data.actual_cash) || 0;
        
        return posTotal - (nonTunai + actualCash);
    };

    const variance = calculateVariance();

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lumos POS & Closing Kas</h2>}>
            <Head title="Lumos POS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                    
                    {/* Form Rekonsiliasi Kas */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Buat Snapshot Kas</h3>
                            
                            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipe Laporan</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="handover">Handover (Ganti Shift)</option>
                                        <option value="closing">Closing (Tutup Toko)</option>
                                    </select>
                                    {errors.type && <div className="text-red-500 text-xs mt-1">{errors.type}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pilih Shift</label>
                                    <select
                                        value={data.shift_id}
                                        onChange={e => setData('shift_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="" disabled>Pilih Shift...</option>
                                        {shifts.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                                        ))}
                                    </select>
                                    {errors.shift_id && <div className="text-red-500 text-xs mt-1">{errors.shift_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Penjualan (Sistem POS)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.pos_total)}
                                        onChange={e => handleCurrencyChange('pos_total', e)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Misal: Rp 1.500.000"
                                        required
                                    />
                                    {errors.pos_total && <div className="text-red-500 text-xs mt-1">{errors.pos_total}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Non-Tunai</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.expected_cash)}
                                        onChange={e => handleCurrencyChange('expected_cash', e)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                                        placeholder="Misal: Rp 500.000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fisik Uang Tunai (Dihitung)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.actual_cash)}
                                        onChange={e => handleCurrencyChange('actual_cash', e)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Misal: Rp 495.000"
                                        required
                                    />
                                </div>

                                {data.pos_total && data.expected_cash && data.actual_cash && (
                                    <div className={`p-3 rounded-md text-sm font-bold ${variance === 0 ? 'bg-green-100 text-green-800' : variance > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        Selisih (Variance): Rp {variance.toLocaleString('id-ID')}
                                        {variance > 0 && <span className="block text-xs font-normal mt-1">⚠️ Terdapat minus uang kas. Wajib sertakan alasan/bukti di catatan.</span>}
                                        {variance < 0 && <span className="block text-xs font-normal mt-1">ℹ️ Terdapat kelebihan uang kas.</span>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Foto Bukti (Struk/Uang)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required
                                    />
                                    {errors.photo && <div className="text-red-500 text-xs mt-1">{errors.photo}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={2}
                                        placeholder="Tulis alasan jika ada selisih"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50 mt-4"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Laporan Kas'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tabel Riwayat */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Riwayat Rekonsiliasi (10 Terakhir)</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu / Tipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pegawai</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POS Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selisih Uang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.map((snap: any) => (
                                            <tr key={snap.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>{new Date(snap.created_at).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{snap.type} ({snap.shift?.name})</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{snap.employee?.user?.name || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {Number(snap.pos_total).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`font-semibold ${snap.variance > 0 ? 'text-red-600' : snap.variance < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                                                        Rp {Number(snap.variance).toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 uppercase">
                                                        {snap.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {history.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada laporan kas.</td>
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
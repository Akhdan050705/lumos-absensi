import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import swal from '@/lib/swal';

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
        if (!data.photo) {
            swal.error('Bukti Diperlukan', 'Harap unggah foto bukti struk atau fisik uang kas.');
            return;
        }

        post('/lumos/snapshot', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                swal.toast('Berhasil!', 'Laporan rekonsiliasi kas berhasil dikirim ke Owner.');
            },
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || 'Periksa kembali formulir rekonsiliasi kas Anda.';
                swal.error('Gagal Mengirim Laporan', msg);
            }
        });
    };

    const formatRupiah = (value: string | number) => {
        if (!value) return '';
        const rawValue = value.toString().replace(/[^0-9]/g, '');
        if (!rawValue) return '';
        return 'Rp ' + Number(rawValue).toLocaleString('id-ID');
    };

    const handleCurrencyChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setData(field, rawValue);
    };

    const calculateVariance = () => {
        const expected = Number(data.expected_cash) || 0;
        const actual = Number(data.actual_cash) || 0;
        return actual - expected;
    };

    const variance = calculateVariance();

    const statusConfig: Record<string, { label: string; cls: string }> = {
        draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
        submitted: { label: 'Menunggu ACC', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
        under_review: { label: 'Ditinjau', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
        revision_requested: { label: 'Perlu Revisi', cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
        verified: { label: 'Terverifikasi (ACC)', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
        rejected: { label: 'Ditolak', cls: 'bg-rose-50 text-rose-700 border border-rose-200' },
        locked: { label: 'Terkunci', cls: 'bg-gray-800 text-white' },
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800 leading-tight">Rekonsiliasi Kas Toko (Lumos)</h2>}>
            <Head title="Lumos POS & Closing Kas" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                    
                    {/* Form Rekonsiliasi Kas */}
                    <div className="w-full lg:w-96 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Form Laporan Kas</h3>
                                    <p className="text-xs text-gray-500">Input penutupan kas harian shift Anda</p>
                                </div>
                            </div>
                            
                            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Tipe Laporan</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        required
                                    >
                                        <option value="closing">Closing (Penutupan Toko)</option>
                                        <option value="handover">Handover (Serah Terima Shift)</option>
                                    </select>
                                    {errors.type && <div className="text-rose-600 text-xs mt-1">{errors.type}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Shift Kerja</label>
                                    <select
                                        value={data.shift_id}
                                        onChange={e => setData('shift_id', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        required
                                    >
                                        <option value="" disabled>Pilih Shift...</option>
                                        {shifts.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                                        ))}
                                    </select>
                                    {errors.shift_id && <div className="text-rose-600 text-xs mt-1">{errors.shift_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Total Penjualan POS</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.pos_total)}
                                        onChange={e => handleCurrencyChange('pos_total', e)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        placeholder="Rp 0"
                                        required
                                    />
                                    {errors.pos_total && <div className="text-rose-600 text-xs mt-1">{errors.pos_total}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Target Kas Seharusnya (Expected Cash)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.expected_cash)}
                                        onChange={e => handleCurrencyChange('expected_cash', e)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        placeholder="Rp 0"
                                        required
                                    />
                                    {errors.expected_cash && <div className="text-rose-600 text-xs mt-1">{errors.expected_cash}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Uang Fisik Dihitung (Actual Cash)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatRupiah(data.actual_cash)}
                                        onChange={e => handleCurrencyChange('actual_cash', e)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-900"
                                        placeholder="Rp 0"
                                        required
                                    />
                                    {errors.actual_cash && <div className="text-rose-600 text-xs mt-1">{errors.actual_cash}</div>}
                                </div>

                                {data.expected_cash && data.actual_cash && (
                                    <div className={`p-3.5 rounded-xl text-xs font-medium border ${
                                        variance === 0 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                            : variance < 0 
                                                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                                : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}>
                                        <div className="flex items-center justify-between font-bold">
                                            <span>Selisih Kas:</span>
                                            <span>{variance === 0 ? 'Rp 0 (Pas)' : (variance > 0 ? '+' : '') + `Rp ${variance.toLocaleString('id-ID')}`}</span>
                                        </div>
                                        {variance < 0 && (
                                            <p className="mt-1 text-[11px] text-rose-700 font-normal">
                                                Defisit kas sebesar Rp {Math.abs(variance).toLocaleString('id-ID')}. Mohon tulis alasan di kolom catatan.
                                            </p>
                                        )}
                                        {variance > 0 && (
                                            <p className="mt-1 text-[11px] text-amber-700 font-normal">
                                                Surplus / kelebihan kas fisik sebesar Rp {variance.toLocaleString('id-ID')}.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Foto Bukti (Struk/Fisik Uang)</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)}
                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                        required
                                    />
                                    {errors.photo && <div className="text-rose-600 text-xs mt-1">{errors.photo}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Catatan (Opsional)</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        rows={2}
                                        placeholder="Keterangan transaksi non-tunai atau selisih..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-50 text-sm mt-2"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Laporan Kas'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tabel Riwayat */}
                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Riwayat Rekonsiliasi Kas</h3>
                                    <p className="text-xs text-gray-500">10 laporan kas terakhir yang disubmit</p>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Waktu & Tipe</th>
                                            <th className="px-6 py-3 text-left">Pegawai</th>
                                            <th className="px-6 py-3 text-right">Total POS</th>
                                            <th className="px-6 py-3 text-right">Selisih Uang</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {history.map((snap: any) => {
                                            const v = Number(snap.variance);
                                            const st = statusConfig[snap.status] || { label: snap.status, cls: 'bg-gray-100 text-gray-700' };
                                            return (
                                                <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                        <div className="font-semibold">{new Date(snap.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                        <div className="text-gray-400 capitalize mt-0.5">{snap.type === 'closing' ? 'Closing Kas' : 'Serah Terima'} ({snap.shift?.name})</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-800 font-medium">{snap.employee?.user?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 text-right font-medium">Rp {Number(snap.pos_total).toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                                                        <span className={`font-semibold ${v < 0 ? 'text-rose-600' : v > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                            {v === 0 ? 'Rp 0' : (v > 0 ? '+' : '') + `Rp ${v.toLocaleString('id-ID')}`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                                                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${st.cls}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {history.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">Belum ada rekonsiliasi kas tercatat.</td>
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
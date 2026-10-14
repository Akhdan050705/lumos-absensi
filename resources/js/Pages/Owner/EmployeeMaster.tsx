import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import swal from '@/lib/swal';

export default function EmployeeMaster({ employees, units }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', password: '', unit_id: '', employee_code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/owner/employees', { 
            onSuccess: () => {
                reset();
                swal.toast('Pegawai baru berhasil didaftarkan!');
            },
            onError: (err: any) => {
                swal.error('Gagal menambahkan pegawai', Object.values(err)[0] as string);
            }
        });
    };

    const toggleStatus = async (id: number, currentStatus: string, name: string) => {
        const isDeactivate = currentStatus === 'active';
        const ok = await swal.confirm(
            isDeactivate ? 'Nonaktifkan Pegawai?' : 'Aktifkan Kembali Pegawai?',
            isDeactivate 
                ? `Akun login ${name} akan diblokir dan pegawai tidak dapat melakukan presensi atau transaksi.`
                : `Akun login ${name} akan diaktifkan kembali.`,
            {
                confirmText: isDeactivate ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan',
                confirmColor: isDeactivate ? '#dc2626' : '#16a34a',
                icon: 'warning'
            }
        );

        if (ok) {
            router.patch(`/owner/employees/${id}/toggle`, {}, {
                onSuccess: () => swal.toast(`Status pegawai berhasil diubah!`),
                onError: (err: any) => swal.error('Gagal mengubah status', Object.values(err)[0] as string)
            });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Manajemen Pegawai</h2>}>
            <Head title="Manajemen Pegawai" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Form */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-20">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                Tambah Pegawai Baru
                            </h3>
                            {errors.general && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">{errors.general}</div>}
                            <form onSubmit={submit} className="space-y-3.5">
                                {[
                                    { label: 'Nama Lengkap', key: 'name', type: 'text', placeholder: 'Nama pegawai' },
                                    { label: 'Kode Pegawai', key: 'employee_code', type: 'text', placeholder: 'LUM-001' },
                                    { label: 'Email Akun', key: 'email', type: 'email', placeholder: 'email@domain.com' },
                                    { label: 'Password Sementara', key: 'password', type: 'password', placeholder: '••••••' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                                        <input type={f.type} value={(data as any)[f.key]} onChange={e => setData(f.key as any, e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" placeholder={f.placeholder} required />
                                        {(errors as any)[f.key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[f.key]}</p>}
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Penempatan</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="block w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" required>
                                        <option value="" disabled>Pilih Unit...</option>
                                        {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={processing} className="w-full mt-2 bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-60 text-sm">
                                    {processing ? 'Menyimpan...' : 'Daftarkan Pegawai'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Daftar Semua Pegawai</h3>
                                <p className="text-xs text-gray-400">{employees.length} total pegawai</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 py-3 text-left">Kode</th>
                                            <th className="px-6 py-3 text-left">Nama & Email</th>
                                            <th className="px-6 py-3 text-left">Unit</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                            <th className="px-6 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {employees.map((emp: any) => (
                                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-700">{emp.employee_code}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{emp.user?.name || '-'}</div>
                                                    <div className="text-xs text-gray-400">{emp.user?.email || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{emp.unit?.name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => toggleStatus(emp.id, emp.status, emp.user?.name || 'Pegawai')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition active:scale-95 ${emp.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                                        {emp.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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

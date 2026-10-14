import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function EmployeeMaster({ employees, units }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', password: '', unit_id: '', employee_code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/owner/employees', { onSuccess: () => reset() });
    };

    const toggleStatus = (id: number) => {
        if (confirm('Yakin ingin mengubah status keaktifan pegawai ini?')) {
            router.patch(`/owner/employees/${id}/toggle`);
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-gray-800"> Manajemen Pegawai</h2>}>
            <Head title="Manajemen Pegawai" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

                    {/* Form */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">+</span>
                                Tambah Pegawai Baru
                            </h3>
                            {errors.general && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{errors.general}</div>}
                            <form onSubmit={submit} className="space-y-4">
                                {[
                                    { label: 'Nama Lengkap', key: 'name', type: 'text', placeholder: 'Nama pegawai' },
                                    { label: 'Kode Pegawai', key: 'employee_code', type: 'text', placeholder: 'LUM-001' },
                                    { label: 'Email Akun', key: 'email', type: 'email', placeholder: 'email@domain.com' },
                                    { label: 'Password', key: 'password', type: 'password', placeholder: '••••••' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{f.label}</label>
                                        <input type={f.type} value={(data as any)[f.key]} onChange={e => setData(f.key as any, e.target.value)} className="block w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition" placeholder={f.placeholder} required />
                                        {(errors as any)[f.key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[f.key]}</p>}
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Unit Penempatan</label>
                                    <select value={data.unit_id} onChange={e => setData('unit_id', e.target.value)} className="block w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none transition" required>
                                        <option value="" disabled>Pilih Unit...</option>
                                        {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={processing} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all disabled:opacity-60">
                                    {processing ? 'Menyimpan...' : 'Daftarkan Pegawai'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800">Daftar Semua Pegawai</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{employees.length} total pegawai terdaftar</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Kode</th>
                                            <th className="px-6 py-3 text-left">Nama & Email</th>
                                            <th className="px-6 py-3 text-left">Unit</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                            <th className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {employees.map((emp: any) => (
                                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-mono font-bold text-indigo-600">{emp.employee_code}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{emp.user?.name}</div>
                                                    <div className="text-xs text-gray-400">{emp.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{emp.unit?.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => toggleStatus(emp.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition active:scale-95 ${emp.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
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

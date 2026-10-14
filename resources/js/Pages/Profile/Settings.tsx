import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Settings({ user }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Pengaturan Akun</h2>}>
            <Head title="Pengaturan" />
            <div className="py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    
                    {/* Profil Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Informasi Profil</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                                <p className="text-sm font-semibold text-gray-900">{user.employee?.profile?.full_name || user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                            </div>
                            {user.employee && (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Kode Pegawai</p>
                                        <p className="text-sm font-semibold text-indigo-600 font-mono">{user.employee.employee_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Unit Penempatan</p>
                                        <p className="text-sm font-semibold text-gray-900">{user.employee.unit?.name}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Ganti Password */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Ubah Password</h3>
                        <form onSubmit={submit} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Password Saat Ini</label>
                                <input 
                                    type="password" 
                                    value={data.current_password} 
                                    onChange={e => setData('current_password', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    required 
                                />
                                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    required 
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    value={data.password_confirmation} 
                                    onChange={e => setData('password_confirmation', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    required 
                                />
                                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={processing} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60">
                                    {processing ? 'Menyimpan...' : 'Simpan Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

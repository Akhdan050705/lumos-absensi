import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import swal from '@/lib/swal';

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
            onSuccess: () => {
                reset();
                swal.success('Password Diperbarui', 'Kata sandi akun Anda berhasil diperbarui. Silakan gunakan password baru ini untuk login berikutnya.');
            },
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || 'Periksa kembali password lama dan konfirmasi password baru Anda.';
                swal.error('Gagal Mengubah Password', msg);
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Pengaturan Akun & Keamanan</h2>}>
            <Head title="Pengaturan Akun" />
            <div className="py-8">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Warning if mandatory password change is active */}
                    {user.must_change_password ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Perhatian: Wajib Ganti Password</h4>
                                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                    Akun Anda saat ini masih menggunakan password default. Demi keamanan sistem, Anda diwajibkan untuk mengganti kata sandi terlebih dahulu sebelum dapat mengakses fitur lainnya.
                                </p>
                            </div>
                        </div>
                    ) : null}
                    
                    {/* Profil Info */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Informasi Profil</h3>
                                <p className="text-xs text-gray-500">Data identitas dan unit kerja akun Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                                <p className="text-sm font-semibold text-gray-900">{user.employee?.profile?.full_name || user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                            </div>
                            {user.employee && (
                                <>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kode Pegawai</p>
                                        <p className="text-sm font-mono font-semibold text-indigo-600">{user.employee.employee_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unit Penempatan</p>
                                        <p className="text-sm font-semibold text-gray-900">{user.employee.unit?.name}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Ganti Password */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Ubah Kata Sandi</h3>
                                <p className="text-xs text-gray-500">Perbarui kata sandi untuk menjaga keamanan akun</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Password Saat Ini</label>
                                <input 
                                    type="password" 
                                    value={data.current_password} 
                                    onChange={e => setData('current_password', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    placeholder="Masukkan password saat ini"
                                    required 
                                />
                                {errors.current_password && <p className="text-rose-600 text-xs mt-1">{errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Password Baru</label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    placeholder="Minimal 8 karakter"
                                    required 
                                />
                                {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Ulangi Password Baru</label>
                                <input 
                                    type="password" 
                                    value={data.password_confirmation} 
                                    onChange={e => setData('password_confirmation', e.target.value)} 
                                    className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                    placeholder="Konfirmasi password baru"
                                    required 
                                />
                                {errors.password_confirmation && <p className="text-rose-600 text-xs mt-1">{errors.password_confirmation}</p>}
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gray-900 hover:bg-black active:scale-[0.99] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Perbarui Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

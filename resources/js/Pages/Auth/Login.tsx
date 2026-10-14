import { FormEventHandler } from 'react';
import { useForm, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import swal from '@/lib/swal';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || 'Email atau password yang Anda masukkan salah.';
                swal.error('Login Gagal', msg);
            }
        });
    };

    return (
        <GuestLayout title="Masuk ke Sistem">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Selamat Datang</h2>
                <p className="text-xs text-gray-500 mt-1">Masuk untuk mengakses sistem presensi dan operasional</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1" htmlFor="email">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        autoComplete="username"
                        placeholder="nama@perusahaan.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1" htmlFor="password">
                        Kata Sandi
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-gray-900 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-xs text-gray-600 font-medium">Ingat Saya</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl shadow transition disabled:opacity-50 text-sm"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Masuk Sekarang'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

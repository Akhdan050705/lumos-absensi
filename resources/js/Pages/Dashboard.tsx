import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

const Icon = {
    users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
    calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>,
    banknotes: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/></svg>,
    chart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
    camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>,
    clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    cash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    scissors: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.936 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.543 12l-3.936 0"/></svg>,
    document: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>,
    receipt: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>,
};

type ModuleCard = { href: string, icon: keyof typeof Icon, title: string, desc: string };

const Card = ({ href, icon, title, desc }: ModuleCard) => {
    const IconComp = Icon[icon];
    return (
        <a href={href} className="group bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:border-indigo-300 hover:shadow-md transition-all duration-150">
            <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 transition-colors shrink-0">
                <IconComp />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </a>
    );
};

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const ownerModules: ModuleCard[] = [
        { href: '/owner/employees', icon: 'users', title: 'Manajemen Pegawai', desc: 'Kelola data akun dan penempatan pegawai di semua unit bisnis.' },
        { href: '/owner/leaves', icon: 'calendar', title: 'Persetujuan Cuti & Izin', desc: 'Tinjau dan proses pengajuan izin dari seluruh pegawai.' },
        { href: '/owner/payroll', icon: 'banknotes', title: 'Penggajian (Payroll)', desc: 'Generate dan lihat kalkulasi gaji bulanan otomatis per unit.' },
        { href: '/owner/reports', icon: 'chart', title: 'Laporan Keuangan', desc: 'Ringkasan pendapatan, beban gaji, dan estimasi laba bersih.' },
    ];
    const lumosModules: ModuleCard[] = [
        { href: '/attendance/camera', icon: 'camera', title: 'Absen Sekarang', desc: 'Check-in atau check-out menggunakan kamera dan verifikasi lokasi GPS.' },
        { href: '/attendance', icon: 'clock', title: 'Riwayat Kehadiran', desc: 'Lihat rekap absensi dan status kehadiran bulan berjalan.' },
        { href: '/lumos/pos', icon: 'cash', title: 'POS & Rekonsiliasi Kas', desc: 'Submit laporan penutupan kas harian beserta foto bukti.' },
        { href: '/leave', icon: 'document', title: 'Pengajuan Cuti & Izin', desc: 'Ajukan izin sakit, absen resmi, atau cuti lainnya.' },
        { href: '/payslip', icon: 'receipt', title: 'Slip Gaji', desc: 'Lihat rincian gaji, potongan, dan take-home pay bulanan.' },
    ];
    const luxeastModules: ModuleCard[] = [
        { href: '/attendance/camera', icon: 'camera', title: 'Absen Sekarang', desc: 'Check-in atau check-out menggunakan kamera dan verifikasi lokasi GPS.' },
        { href: '/attendance', icon: 'clock', title: 'Riwayat Kehadiran', desc: 'Lihat rekap absensi dan status kehadiran bulan berjalan.' },
        { href: '/luxeast/cashier', icon: 'scissors', title: 'Kasir Barbershop', desc: 'Catat transaksi layanan, pilih kapster, dan metode pembayaran.' },
        { href: '/leave', icon: 'document', title: 'Pengajuan Cuti & Izin', desc: 'Ajukan izin sakit, absen resmi, atau cuti lainnya.' },
        { href: '/payslip', icon: 'receipt', title: 'Slip Gaji & Komisi', desc: 'Lihat rincian gaji pokok, komisi bagi hasil, dan take-home pay.' },
    ];

    const modules = auth.role === 'owner' ? ownerModules : auth.role === 'employee_lumos' ? lumosModules : luxeastModules;
    const unitLabel = auth.unit?.name || '';

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="py-8 space-y-8">

                {/* Welcome */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">{today}</p>
                        <h2 className="text-xl font-bold text-gray-900 mt-1">{greeting}, {auth.profile?.full_name || auth.user.name}.</h2>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="inline-block text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md">
                                {auth.role === 'owner' ? 'Owner' : auth.role === 'employee_lumos' ? 'Pegawai Lumos' : 'Pegawai Luxeast'}
                            </span>
                            {unitLabel && (
                                <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">{unitLabel}</span>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:block w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
                        </svg>
                    </div>
                </div>

                {/* Module Grid */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Menu Utama</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modules.map(m => <Card key={m.href} {...m} />)}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

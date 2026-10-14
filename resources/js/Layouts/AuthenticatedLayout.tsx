import { ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NavItem = ({ href, label, active }: { href: string, label: string, active: boolean }) => (
    <a href={href} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
        {label}
    </a>
);

export default function AuthenticatedLayout({ children, header }: { children: ReactNode, header?: ReactNode }) {
    const { auth } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const path = typeof window !== 'undefined' ? window.location.pathname : '';

    const ownerNav = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/owner/employees', label: 'Pegawai' },
        { href: '/owner/manual-attendance', label: 'Koreksi Absen' },
        { href: '/owner/leaves', label: 'Cuti & Izin' },
        { href: '/owner/payroll', label: 'Penggajian' },
        { href: '/owner/reports', label: 'Laporan' },
    ];
    const lumosNav = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/attendance', label: 'Absensi' },
        { href: '/manual-attendance', label: 'Koreksi Absen' },
        { href: '/lumos/pos', label: 'POS & Kas' },
        { href: '/leave', label: 'Cuti' },
        { href: '/payslip', label: 'Slip Gaji' },
    ];
    const luxeastNav = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/attendance', label: 'Absensi' },
        { href: '/manual-attendance', label: 'Koreksi Absen' },
        { href: '/luxeast/cashier', label: 'Kasir' },
        { href: '/leave', label: 'Cuti' },
        { href: '/payslip', label: 'Slip Gaji' },
    ];

    const navItems = auth.role === 'owner' ? ownerNav : auth.role === 'employee_lumos' ? lumosNav : luxeastNav;

    const roleLabel: Record<string, string> = {
        owner: 'Owner',
        employee_lumos: 'Lumos',
        employee_luxeast: 'Luxeast',
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                    <div className="flex items-center gap-6">
                        <a href="/dashboard" className="font-bold text-gray-900 text-base tracking-tight flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-indigo-600" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                            Lumos Absession
                        </a>
                        <nav className="hidden sm:flex items-center gap-1">
                            {navItems.map(n => (
                                <NavItem key={n.href} href={n.href} label={n.label} active={path === n.href || (n.href !== '/dashboard' && path.startsWith(n.href))} />
                            ))}
                        </nav>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <div className="relative group">
                            <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                {auth.notifications?.length > 0 && (
                                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {auth.notifications?.length > 0 && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-800">Notifikasi</span>
                                        <Link href="/notifications/read-all" method="post" as="button" className="text-xs text-indigo-600 font-medium">Tandai dibaca</Link>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {auth.notifications.map((n: any) => (
                                            <div key={n.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                                                <p className="text-sm text-gray-800">{n.data?.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-right border-l border-gray-200 pl-4">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{auth.profile?.full_name || auth.user.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                <span className="inline-block bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded text-xs">{roleLabel[auth.role] || auth.role}</span>
                                {auth.unit && <span className="ml-1 text-gray-400">{auth.unit.name}</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link href="/profile" className="text-sm text-gray-500 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                                Pengaturan
                            </Link>
                            <Link href="/logout" method="post" as="button" className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                                Keluar
                            </Link>
                        </div>
                    </div>

                    <button className="sm:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100" onClick={() => setOpen(!open)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>}
                        </svg>
                    </button>
                </div>

                {open && (
                    <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                        {navItems.map(n => (
                            <a key={n.href} href={n.href} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">{n.label}</a>
                        ))}
                        <div className="border-t pt-2 mt-2">
                            <Link href="/logout" method="post" as="button" className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">Keluar</Link>
                        </div>
                    </div>
                )}
            </header>

            {header && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">{header}</div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}

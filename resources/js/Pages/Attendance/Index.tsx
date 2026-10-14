import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ shifts, todayAttendance, history }: any) {
    const { auth } = usePage().props as any;
    const hasClockedIn = todayAttendance && todayAttendance.check_in;
    const hasClockedOut = todayAttendance && todayAttendance.check_out;

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Absensi Harian</h2>}>
            <Head title="Absensi" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Catat Kehadiran Anda</h3>
                        
                        {!hasClockedIn && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Shift</label>
                                <select id="shift_select" className="w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {shifts.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex space-x-4 mt-6">
                            {!hasClockedIn ? (
                                <button
                                    onClick={() => {
                                        const shiftId = (document.getElementById('shift_select') as HTMLSelectElement).value;
                                        window.location.href = `/attendance/camera?type=in&shift_id=${shiftId}`;
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
                                >
                                     Mulai Clock In
                                </button>
                            ) : !hasClockedOut ? (
                                <Link
                                    href={`/attendance/camera?type=out&shift_id=${todayAttendance.shift_id}`}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
                                >
                                     Mulai Clock Out
                                </Link>
                            ) : (
                                <div className="bg-green-100 text-green-800 p-4 rounded-md font-medium w-full">
                                     Anda telah menyelesaikan absensi untuk hari ini.
                                </div>
                            )}
                        </div>
                        
                        {todayAttendance && (
                            <div className="mt-6 text-sm text-gray-600 border-t pt-4">
                                <p><strong>Waktu Clock In:</strong> {todayAttendance.check_in}</p>
                                <p><strong>Waktu Clock Out:</strong> {todayAttendance.check_out || 'Belum'}</p>
                                {todayAttendance.late_minutes > 0 && (
                                    <p className="text-red-600"><strong>Terlambat:</strong> {todayAttendance.late_minutes} Menit</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Riwayat 5 Hari Terakhir</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((h: any) => (
                                        <tr key={h.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.shift?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {h.check_in ? new Date(h.check_in).toLocaleTimeString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {h.check_out ? new Date(h.check_out).toLocaleTimeString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${h.late_minutes > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {h.late_minutes > 0 ? `Telat ${h.late_minutes}m` : 'Tepat Waktu'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada data.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

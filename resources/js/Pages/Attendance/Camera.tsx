import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import swal from '@/lib/swal';

export default function Camera({ shift_id, shift, type, unit_location, server_time }: any) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [streamActive, setStreamActive] = useState(false);
    const [capturedImg, setCapturedImg] = useState<string | null>(null);
    const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [showLateModal, setShowLateModal] = useState(false);
    const [showEarlyLeaveModal, setShowEarlyLeaveModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        shift_id: shift_id,
        type: type,
        image: '',
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        late_reason: 'Kendala Pribadi / Kesiangan (Bangun kesiangan atau kendala pribadi)',
        late_notes: '',
        early_leave_reason: 'Sakit Mendadak / Kurang Enak Badan',
        early_leave_notes: '',
    });

    useEffect(() => {
        startCamera();
        getLocation();

        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreamActive(true);
            }
        } catch (err) {
            console.error("Gagal mengakses kamera:", err);
            swal.error("Akses Kamera Ditolak", "Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin akses kamera pada peramban.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            const err = "Browser Anda tidak mendukung deteksi lokasi Geolocation.";
            setLocationError(err);
            swal.error("GPS Tidak Didukung", err);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy || 10;
                setLocation({ lat, lng, accuracy });
                setData(d => ({ ...d, latitude: lat, longitude: lng, accuracy: accuracy }));
            },
            (error) => {
                const err = "Gagal mendeteksi lokasi GPS. Pastikan fitur Lokasi pada perangkat aktif dan izin telah diberikan.";
                setLocationError(err);
                swal.error("Gagal Membaca GPS", err);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Img = canvas.toDataURL('image/jpeg', 0.85);
                setCapturedImg(base64Img);
                setData(d => ({ ...d, image: base64Img }));
                stopCamera();
            }
        }
    };

    const retakeImage = () => {
        setCapturedImg(null);
        setData('image', '');
        setShowLateModal(false);
        setShowEarlyLeaveModal(false);
        startCamera();
    };

    const checkIfLate = () => {
        if (type !== 'in' || !shift || !shift.start_time) return false;
        const now = new Date();
        const [h, m] = shift.start_time.split(':').map(Number);
        const shiftStart = new Date();
        shiftStart.setHours(h, m, 0, 0);
        return now > shiftStart;
    };

    const checkIfEarly = () => {
        if (type !== 'out' || !shift || !shift.end_time) return false;
        const now = new Date();
        const [h, m] = shift.end_time.split(':').map(Number);
        const shiftEnd = new Date();
        shiftEnd.setHours(h, m, 0, 0);
        return now < shiftEnd;
    };

    const handlePreSubmit = () => {
        if (!data.image || !data.latitude || !data.longitude) {
            swal.error("Data Belum Lengkap", "Silakan ambil foto wajah dan pastikan koordinat lokasi GPS telah terdeteksi.");
            return;
        }

        if (type === 'in' && checkIfLate()) {
            setShowLateModal(true);
        } else if (type === 'out' && checkIfEarly()) {
            setShowEarlyLeaveModal(true);
        } else {
            executeSubmit();
        }
    };

    const executeSubmit = () => {
        post('/attendance/store', {
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || "Terjadi kesalahan saat memproses data presensi Anda.";
                swal.error("Presensi Gagal", msg);
            }
        });
    };

    const lateOptions = [
        { label: 'Kendala Pribadi / Kesiangan (Bangun kesiangan atau kendala pribadi)', val: 'Kendala Pribadi / Kesiangan (Bangun kesiangan atau kendala pribadi)' },
        { label: 'Kendala Lalu Lintas (Kemacetan parah / pengalihan arus / kecelakaan)', val: 'Kendala Lalu Lintas (Kemacetan parah / pengalihan arus / kecelakaan)' },
        { label: 'Kendala Kendaraan (Kendaraan mogok / ban bocor / kerusakan mesin)', val: 'Kendala Kendaraan (Kendaraan mogok / ban bocor / kerusakan mesin)' },
        { label: 'Kendala Teknis / Sistem (Gangguan jaringan internet / GPS / server)', val: 'Kendala Teknis / Sistem (Gangguan jaringan internet / GPS / server)' },
        { label: 'Urusan Darurat Keluarga (Kondisi mendesak keluarga)', val: 'Urusan Darurat Keluarga (Kondisi mendesak keluarga)' },
        { label: 'Lainnya', val: 'Lainnya' },
    ];

    const earlyOptions = [
        { label: 'Sakit Mendadak / Kurang Enak Badan', val: 'Sakit Mendadak / Kurang Enak Badan' },
        { label: 'Keperluan Mendesak / Darurat Keluarga', val: 'Keperluan Mendesak / Darurat Keluarga' },
        { label: 'Izin Resmi Disetujui Rekan / Atasan', val: 'Izin Resmi Disetujui Rekan / Atasan' },
        { label: 'Toko Sepi / Instruksi Khusus Operasional', val: 'Toko Sepi / Instruksi Khusus Operasional' },
        { label: 'Kendala Transportasi / Cuaca Ekstrem', val: 'Kendala Transportasi / Cuaca Ekstrem' },
        { label: 'Lainnya', val: 'Lainnya' },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800 leading-tight">Presensi Foto Wajah & Lokasi GPS</h2>}>
            <Head title="Verifikasi Absensi" />

            <div className="py-8">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 sm:rounded-2xl p-6">
                        
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900">
                                Verifikasi {type === 'in' ? 'Clock In (Masuk)' : 'Clock Out (Pulang)'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Shift: {shift?.name || 'Reguler'} ({shift?.start_time ? shift.start_time.slice(0, 5) : '-'} s/d {shift?.end_time ? shift.end_time.slice(0, 5) : '-'} WIB)
                            </p>
                        </div>

                        {/* Error Handling Backend */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs space-y-1">
                                {Object.values(errors).map((err: any, i) => <div key={i}>• {err}</div>)}
                            </div>
                        )}

                        {/* Location Info */}
                        <div className={`mb-5 p-3.5 rounded-xl text-xs font-medium border ${location ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Status Lokasi:</span>
                                <span>{location ? `Akurasi ±${Math.round(location.accuracy)} meter` : 'Mendeteksi...'}</span>
                            </div>
                            <div className="mt-1 font-mono text-[11px] text-gray-700">
                                {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : (locationError || 'Sedang mencari koordinat GPS presisi tinggi...')}
                            </div>
                            {unit_location && (
                                <div className="text-[11px] mt-2 pt-2 border-t border-gray-200/60 text-gray-600 font-normal">
                                    <span className="font-medium text-gray-800">Target Kantor:</span> {unit_location.address} (Radius: {unit_location.radius}m)
                                </div>
                            )}
                        </div>

                        {/* Camera Frame */}
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[3/4] sm:aspect-video mb-5 flex justify-center items-center shadow-inner">
                            {!capturedImg ? (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                            ) : (
                                <img src={capturedImg} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>

                            {/* Face guide outline */}
                            {!capturedImg && (
                                <div className="absolute inset-0 border-2 border-dashed border-white/60 m-8 rounded-[48%] pointer-events-none"></div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col space-y-2.5">
                            {!capturedImg ? (
                                <button
                                    onClick={captureImage}
                                    disabled={!location}
                                    className="w-full bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow transition-all disabled:opacity-50 text-sm"
                                >
                                    Ambil Foto Presensi
                                </button>
                            ) : (
                                <div className="flex space-x-2.5">
                                    <button
                                        onClick={retakeImage}
                                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition-colors text-sm"
                                    >
                                        Foto Ulang
                                    </button>
                                    <button
                                        onClick={handlePreSubmit}
                                        disabled={processing}
                                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow transition-all disabled:opacity-50 text-sm"
                                    >
                                        {processing ? 'Menyimpan...' : 'Kirim Presensi'}
                                    </button>
                                </div>
                            )}
                            
                            <Link href="/attendance" className="text-center text-xs text-gray-400 hover:text-gray-600 pt-2 block">
                                Batalkan dan kembali ke riwayat
                            </Link>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Modal Alasan Terlambat */}
            {showLateModal && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Terdeteksi Keterlambatan Masuk</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Shift Anda ({shift?.name}) dimulai pukul <span className="font-semibold text-gray-800">{shift?.start_time ? shift.start_time.slice(0, 5) : '-'} WIB</span>.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Pilih Alasan Keterlambatan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.late_reason}
                                    onChange={e => setData('late_reason', e.target.value)}
                                    className="block w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    {lateOptions.map((opt, i) => (
                                        <option key={i} value={opt.val}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan / Penjelasan Tambahan (Opsional)
                                </label>
                                <textarea
                                    value={data.late_notes}
                                    onChange={e => setData('late_notes', e.target.value)}
                                    rows={2}
                                    className="block w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder="Jelaskan detail kendala Anda..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowLateModal(false)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={executeSubmit}
                                className="text-xs font-semibold bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Kirim Presensi & Alasan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alasan Pulang Lebih Awal */}
            {showEarlyLeaveModal && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Pulang Sebelum Jam Shift Berakhir</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Jadwal shift Anda ({shift?.name}) selesai pukul <span className="font-semibold text-gray-800">{shift?.end_time ? shift.end_time.slice(0, 5) : '-'} WIB</span>.
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                            Anda tetap dapat melakukan absensi pulang saat ini. Alasan pulang lebih awal Anda akan dicatat dan ditinjau oleh Owner untuk persetujuan.
                        </div>

                        <div className="space-y-3 pt-1">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Pilih Alasan Pulang Cepat <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.early_leave_reason}
                                    onChange={e => setData('early_leave_reason', e.target.value)}
                                    className="block w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    {earlyOptions.map((opt, i) => (
                                        <option key={i} value={opt.val}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan / Penjelasan Tambahan (Opsional)
                                </label>
                                <textarea
                                    value={data.early_leave_notes}
                                    onChange={e => setData('early_leave_notes', e.target.value)}
                                    rows={2}
                                    className="block w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder="Jelaskan detail alasan mengapa harus pulang lebih awal..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowEarlyLeaveModal(false)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={executeSubmit}
                                className="text-xs font-semibold bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Kirim Absensi Pulang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

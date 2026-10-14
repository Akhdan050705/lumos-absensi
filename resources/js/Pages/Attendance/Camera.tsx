import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import swal from '@/lib/swal';

export default function Camera({ shift_id, type, unit_location }: any) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [streamActive, setStreamActive] = useState(false);
    const [capturedImg, setCapturedImg] = useState<string | null>(null);
    const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        shift_id: shift_id,
        type: type,
        image: '',
        latitude: 0,
        longitude: 0,
        accuracy: 0,
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
        startCamera();
    };

    const submitAttendance = () => {
        if (!data.image || !data.latitude || !data.longitude) {
            swal.error("Data Belum Lengkap", "Silakan ambil foto wajah dan pastikan koordinat lokasi GPS telah terdeteksi.");
            return;
        }

        post('/attendance/store', {
            onError: (err: any) => {
                const msg = Object.values(err)[0] as string || "Terjadi kesalahan saat memproses data presensi Anda.";
                swal.error("Presensi Gagal", msg);
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-base text-gray-800 leading-tight">Presensi Foto Wajah & Lokasi GPS</h2>}>
            <Head title="Verifikasi Absensi" />

            <div className="py-8">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 sm:rounded-2xl p-6">
                        
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900">Verifikasi {type === 'in' ? 'Clock In (Masuk)' : 'Clock Out (Pulang)'}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Posisikan wajah Anda tegak lurus ke kamera dan pastikan GPS dalam radius kantor.</p>
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
                                    <span className="font-medium text-gray-800">Target Kantor:</span> {unit_location.address} (Radius: {unit_location.radius}m, Batas Akurasi: {unit_location.accuracy_limit}m)
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
                                        onClick={submitAttendance}
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
        </AuthenticatedLayout>
    );
}

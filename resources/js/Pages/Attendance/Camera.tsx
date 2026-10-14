import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Camera({ shift_id, type, unit_location }: any) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [streamActive, setStreamActive] = useState(false);
    const [capturedImg, setCapturedImg] = useState<string | null>(null);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        shift_id: shift_id,
        type: type,
        image: '',
        latitude: 0,
        longitude: 0,
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
            alert("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
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
            setLocationError("Browser Anda tidak mendukung Geolocation.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setLocation({ lat, lng });
                setData(d => ({ ...d, latitude: lat, longitude: lng }));
            },
            (error) => {
                setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
            },
            { enableHighAccuracy: true }
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
                const base64Img = canvas.toDataURL('image/jpeg', 0.8);
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
            alert("Lengkapi foto dan pastikan lokasi GPS terbaca.");
            return;
        }
        post('/attendance/store');
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Absensi Wajah (Face Liveness)</h2>}>
            <Head title="Verifikasi Absensi" />

            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-4">
                            <h3 className="text-lg font-bold">Verifikasi {type === 'in' ? 'Clock In' : 'Clock Out'}</h3>
                            <p className="text-sm text-gray-600">Pastikan wajah Anda terlihat jelas dalam frame dan GPS aktif.</p>
                        </div>

                        {/* Error Handling Backend */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">
                                {Object.values(errors).map((err: any, i) => <div key={i}>• {err}</div>)}
                            </div>
                        )}

                        {/* Location Info */}
                        <div className={`mb-6 p-3 rounded-md text-sm font-medium ${location ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                             Lokasi: {location ? `${location.lat}, ${location.lng}` : (locationError || 'Sedang mencari koordinat GPS...')}
                            {unit_location && (
                                <div className="text-xs mt-1 text-gray-500 font-normal">Toleransi Area: {unit_location.name} (Radius {unit_location.radius_meters}m)</div>
                            )}
                        </div>

                        {/* Camera Frame */}
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[3/4] sm:aspect-video mb-6 flex justify-center items-center shadow-inner">
                            {!capturedImg ? (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                            ) : (
                                <img src={capturedImg} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>

                            {/* Liveness Overlay Outline (Visual aid) */}
                            {!capturedImg && (
                                <div className="absolute inset-0 border-4 border-dashed border-indigo-400 opacity-50 m-12 rounded-[100%] pointer-events-none"></div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col space-y-3">
                            {!capturedImg ? (
                                <button
                                    onClick={captureImage}
                                    disabled={!location}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded shadow disabled:opacity-50"
                                >
                                     Ambil Foto
                                </button>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={retakeImage}
                                        className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded shadow"
                                    >
                                        Ulang
                                    </button>
                                    <button
                                        onClick={submitAttendance}
                                        disabled={processing}
                                        className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded shadow disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : ' Kirim Absensi'}
                                    </button>
                                </div>
                            )}
                            
                            <Link href="/attendance" className="text-center text-sm text-gray-500 hover:text-gray-700 mt-4 block">
                                Batalkan
                            </Link>
                        </div>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

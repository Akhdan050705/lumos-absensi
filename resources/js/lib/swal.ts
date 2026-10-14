import Swal from 'sweetalert2';

/**
 * SweetAlert2 utility wrapper — consistent styling across the app.
 */

const base = {
    customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 text-sm font-semibold',
        cancelButton: 'rounded-lg px-4 py-2 text-sm font-semibold',
    },
    buttonsStyling: true,
    reverseButtons: true,
};

/** Success toast (auto-close, top-end) */
export function toast(title: string, text?: string) {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title,
        text,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
}

/** Error toast */
export function toastError(title: string, text?: string) {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title,
        text,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });
}

/** Info toast */
export function toastInfo(title: string, text?: string) {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title,
        text,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
}

/** Success dialog (centered, with OK button) */
export function success(title: string, text?: string) {
    return Swal.fire({
        ...base,
        icon: 'success',
        title,
        text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#111827',
    });
}

/** Error dialog */
export function error(title: string, text?: string) {
    return Swal.fire({
        ...base,
        icon: 'error',
        title,
        text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#DC2626',
    });
}

/** Confirmation dialog (returns promise — true if confirmed) */
export async function confirm(
    title: string,
    text: string,
    opts?: {
        confirmText?: string;
        cancelText?: string;
        icon?: 'warning' | 'question' | 'info';
        confirmColor?: string;
    }
): Promise<boolean> {
    const result = await Swal.fire({
        ...base,
        icon: opts?.icon || 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: opts?.confirmText || 'Ya, lanjutkan',
        cancelButtonText: opts?.cancelText || 'Batal',
        confirmButtonColor: opts?.confirmColor || '#111827',
        cancelButtonColor: '#6B7280',
    });
    return result.isConfirmed;
}

/** Destructive confirmation (red confirm button) */
export async function confirmDanger(title: string, text: string, confirmText?: string): Promise<boolean> {
    return confirm(title, text, {
        confirmText: confirmText || 'Ya, hapus',
        icon: 'warning',
        confirmColor: '#DC2626',
    });
}

/**
 * Prompts user that the shift is not active when trying to access restricted operational pages.
 * Explains why the page is inaccessible and offers a button to navigate to the attendance page.
 */
export async function promptShiftRequired(
    pageName: string,
    status: 'not_started' | 'ended' = 'not_started',
    customMessage?: string
): Promise<boolean> {
    const isEnded = status === 'ended';
    const result = await Swal.fire({
        ...base,
        icon: isEnded ? 'info' : 'warning',
        title: isEnded ? 'Shift Kerja Hari Ini Selesai' : 'Akses Dibatasi: Wajib Presensi Masuk',
        html: `
            <div class="text-left text-sm text-gray-600 space-y-3 mt-2">
                <p>
                    ${customMessage || (isEnded 
                        ? `Anda telah menyelesaikan absensi pulang (Clock Out). Halaman <b>${pageName}</b> telah ditutup untuk shift hari ini.` 
                        : `Anda tidak dapat membuka halaman <b>${pageName}</b> karena belum melakukan absensi masuk (Clock In) untuk shift kerja hari ini.`)}
                </p>
                <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                    ${isEnded 
                        ? 'Akses ke modul operasional (POS/Kasir & Koreksi) akan dibuka kembali pada jadwal shift kerja berikutnya.' 
                        : 'Silakan lakukan absensi masuk terlebih dahulu menggunakan foto selfie dan verifikasi lokasi GPS untuk mengaktifkan jam kerja Anda.'}
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Buka Halaman Presensi',
        cancelButtonText: 'Tutup / Tetap di Sini',
        confirmButtonColor: '#4F46E5',
        cancelButtonColor: '#6B7280',
    });

    if (result.isConfirmed) {
        window.location.href = '/attendance';
        return true;
    }
    return false;
}

export default { toast, toastError, toastInfo, success, error, confirm, confirmDanger, promptShiftRequired };

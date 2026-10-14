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

export default { toast, toastError, toastInfo, success, error, confirm, confirmDanger };

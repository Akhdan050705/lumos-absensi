import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';

export default function GuestLayout({ children, title }: { children: ReactNode, title?: string }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center pt-6 sm:pt-0">
            {title && <Head title={title} />}
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="flex justify-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Lumos Absession</h1>
                </div>
                {children}
            </div>
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KitchenRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/kitchen');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Mutfak ekranına yönlendiriliyorsunuz...</p>
            </div>
        </div>
    );
}

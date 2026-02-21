'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, accessToken } = useAuthStore();

    // Derive loading state directly — no useState/useEffect needed
    const isReady = isAuthenticated && !!accessToken;

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, accessToken, router]);

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

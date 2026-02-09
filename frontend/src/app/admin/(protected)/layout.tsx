'use client';

import { AuthGuard, AdminLayout } from '@/components/admin';

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <AdminLayout>
                {children}
            </AdminLayout>
        </AuthGuard>
    );
}

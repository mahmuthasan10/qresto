'use client';

import Link from 'next/link';
import { Card, CardBody } from '@/components/ui';
import { Users, Settings, ChefHat, Palette } from 'lucide-react';

export default function WireframePage() {
    const wireframes = [
        {
            title: 'Müşteri Arayüzü',
            description: 'QR okutma, menü, sepet, sipariş takip',
            href: '/wireframe/customer',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Admin Paneli',
            description: 'Dashboard, menü/masa yönetimi, siparişler',
            href: '/wireframe/admin',
            icon: Settings,
            color: 'bg-purple-500',
        },
        {
            title: 'Mutfak Ekranı',
            description: 'Kanban 3-kolon sipariş yönetimi',
            href: '/wireframe/kitchen',
            icon: ChefHat,
            color: 'bg-orange-500',
        },
        {
            title: 'Component Demo',
            description: 'Tüm UI komponentleri',
            href: '/demo',
            icon: Palette,
            color: 'bg-green-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">🍕 QResto Wireframes</h1>
                    <p className="text-gray-400">Hafta 2 - UI/UX Tasarım Çıktıları</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wireframes.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Card hoverable className="h-full">
                                <CardBody className="flex items-start gap-4">
                                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    ))}
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Next.js 16 + Tailwind CSS 4 + TypeScript
                </p>
            </div>
        </div>
    );
}

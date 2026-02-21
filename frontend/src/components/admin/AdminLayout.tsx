'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Grid3X3,
    ClipboardList,
    Settings,
    LogOut,
    Menu as MenuIcon,
    X,
    Bell,
    ChevronDown,
    Gift,
    BarChart3,
    ChefHat
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'menu', label: 'Menü', icon: UtensilsCrossed, href: '/admin/menu' },
    { id: 'tables', label: 'Masalar', icon: Grid3X3, href: '/admin/tables' },
    { id: 'orders', label: 'Siparişler', icon: ClipboardList, href: '/admin/orders' },
    { id: 'kitchen', label: 'Mutfak', icon: ChefHat, href: '/admin/kitchen' },
    { id: 'treats', label: 'İkramlar', icon: Gift, href: '/admin/treats' },
    { id: 'analytics', label: 'Analitik', icon: BarChart3, href: '/admin/analytics' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, href: '/admin/settings' },
];

function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { restaurant, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <span className="text-2xl">🍕</span>
                        <span className="text-xl font-bold">QResto</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Restaurant Info */}
                <div className="px-6 py-4 border-b border-gray-700">
                    <p className="text-sm text-gray-400">Restoran</p>
                    <p className="font-medium truncate">{restaurant?.name || 'Yükleniyor...'}</p>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>
        </>
    );
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { restaurant } = useAuthStore();
    const pathname = usePathname();

    // Get current page title
    const getCurrentTitle = () => {
        const currentItem = menuItems.find(item => pathname === item.href);
        return currentItem?.label || 'Admin Panel';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                        >
                            <MenuIcon size={24} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {getCurrentTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* Profile */}
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-orange-600">
                                    {restaurant?.name?.charAt(0) || 'R'}
                                </span>
                            </div>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

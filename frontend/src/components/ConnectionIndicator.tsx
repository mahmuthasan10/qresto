'use client';

import { useSocketStatus, ConnectionStatus } from '@/lib/socket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionIndicatorProps {
    className?: string;
    showText?: boolean;
}

const statusConfig: Record<ConnectionStatus, {
    icon: React.ReactNode;
    text: string;
    color: string;
    bgColor: string;
}> = {
    connected: {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Bağlı',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    connecting: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: 'Bağlanıyor...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
    disconnected: {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Bağlantı Kesildi',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
    },
    error: {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Bağlantı Hatası',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
};

export default function ConnectionIndicator({ className = '', showText = true }: ConnectionIndicatorProps) {
    const status = useSocketStatus();
    const config = statusConfig[status];

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color} ${className}`}
            title={config.text}
        >
            {config.icon}
            {showText && <span className="text-sm font-medium">{config.text}</span>}
        </div>
    );
}

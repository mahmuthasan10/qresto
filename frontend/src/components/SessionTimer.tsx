'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { publicApi } from '@/lib/api';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface SessionTimerProps {
    onExpire?: () => void;
    className?: string;
}

export default function SessionTimer({ onExpire, className = '' }: SessionTimerProps) {
    const { sessionToken, expiresAt, setSession, clearSession, tableNumber, restaurantName } = useCartStore();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isWarning, setIsWarning] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [extending, setExtending] = useState(false);

    // Calculate time left
    const calculateTimeLeft = useCallback(() => {
        if (!expiresAt) return 0;
        const expiry = new Date(expiresAt).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((expiry - now) / 1000));
    }, [expiresAt]);

    // Update timer every second
    useEffect(() => {
        if (!sessionToken || !expiresAt) return;

        const updateTimer = () => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            setIsWarning(remaining <= 300 && remaining > 0); // 5 minutes warning

            if (remaining <= 0) {
                setIsExpired(true);
                onExpire?.();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [sessionToken, expiresAt, calculateTimeLeft, onExpire]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Extend session
    const handleExtend = async () => {
        if (!sessionToken) return;

        setExtending(true);
        try {
            const response = await publicApi.patch(`/sessions/${sessionToken}/extend`);
            const newExpiresAt = new Date(response.data.session.expiresAt);

            if (tableNumber && restaurantName) {
                setSession(sessionToken, tableNumber, restaurantName, newExpiresAt);
            }

            setIsExpired(false);
            setIsWarning(false);
        } catch (error) {
            console.error('Session extend failed:', error);
        } finally {
            setExtending(false);
        }
    };

    // Handle session end
    const handleEndSession = () => {
        clearSession();
        window.location.href = '/';
    };

    if (!sessionToken) return null;

    // Expired modal
    if (isExpired) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oturum Süresi Doldu</h2>
                    <p className="text-gray-600 mb-6">
                        Güvenlik nedeniyle oturumunuz sona erdi. Devam etmek için süreyi uzatabilirsiniz.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleExtend}
                            disabled={extending}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {extending ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Uzatılıyor...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    Süreyi Uzat (+10 dk)
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                        >
                            Oturumu Sonlandır
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex items-center gap-1 text-sm ${isWarning ? 'text-red-500 animate-pulse font-medium' : 'text-gray-500'
                } ${className}`}
        >
            <Clock className={`w-4 h-4 ${isWarning ? 'text-red-500' : ''}`} />
            <span>{formatTime(timeLeft)}</span>
            {isWarning && (
                <button
                    onClick={handleExtend}
                    disabled={extending}
                    className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full hover:bg-red-200"
                >
                    {extending ? '...' : 'Uzat'}
                </button>
            )}
        </div>
    );
}

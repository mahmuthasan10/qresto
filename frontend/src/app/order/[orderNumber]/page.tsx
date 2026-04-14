'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Button, Card, CardBody } from '@/components/ui';
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Bell,
    Package,
    XCircle,
    ChevronLeft,
    RefreshCw
} from 'lucide-react';

interface OrderItem {
    id: number;
    itemName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    notes?: string;
}

interface Order {
    orderNumber: string;
    status: string;
    tableNumber: string;
    totalAmount: string;
    paymentMethod: string;
    createdAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    completedAt?: string;
    items: OrderItem[];
    restaurant: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    pending: { label: 'Bekliyor', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    confirmed: { label: 'Onaylandı', icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    preparing: { label: 'Hazırlanıyor', icon: ChefHat, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    ready: { label: 'Hazır', icon: Bell, color: 'text-green-600', bgColor: 'bg-green-100' },
    completed: { label: 'Tamamlandı', icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    cancelled: { label: 'İptal Edildi', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const orderNumber = params.orderNumber as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchOrder = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const response = await publicApi.get(`/public/orders/${orderNumber}`);
            const fetched: Order = response.data.order;
            setOrder(fetched);
            // Tamamlandı veya iptal edildiyse polling'i durdur
            if (fetched.status === 'completed' || fetched.status === 'cancelled') {
                stopPolling();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            if (showLoader) setError(axiosErr.response?.data?.error || 'Sipariş bulunamadı');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const startPolling = () => {
        if (pollingRef.current) return; // Zaten çalışıyor
        pollingRef.current = setInterval(() => {
            fetchOrder(false); // Loader göstermeden arka planda güncelle
        }, 15_000);
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    useEffect(() => {
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    // WebSocket for real-time updates + polling fallback
    useEffect(() => {
        const socket = socketService.connect();

        const handleConnect = () => {
            setSocketConnected(true);
            stopPolling(); // Socket bağlandıysa polling'e gerek yok
        };

        const handleDisconnect = () => {
            setSocketConnected(false);
            startPolling(); // Socket kopunca polling başlat
        };

        // Socket.io olaylarını dinle
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Bağlantı durumuna göre başlangıç ayarı
        if (socket.connected) {
            setSocketConnected(true);
        } else {
            startPolling(); // Bağlanamadıysa hemen polling başlat
        }

        socketService.onOrderStatusUpdated((data) => {
            if (data.orderNumber === orderNumber) {
                setOrder((prev) => {
                    if (!prev) return prev;
                    const updated = { ...prev, status: data.status };
                    if (data.status === 'completed' || data.status === 'cancelled') {
                        stopPolling();
                    }
                    return updated;
                });
            }
        });

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socketService.removeAllListeners();
            stopPolling();
        };
    }, [orderNumber]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Sipariş yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardBody className="text-center py-12">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const currentStatus = statusConfig[order.status] || statusConfig.pending;
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';

    // Tahmini süre hesapla
    const getEstimatedTime = () => {
        if (isCancelled || isCompleted) return null;

        const createdAt = new Date(order.createdAt);
        const now = new Date();
        const elapsedMin = Math.floor((now.getTime() - createdAt.getTime()) / 1000 / 60);

        // Ortalama tahmini süreler (dakika)
        const estimatedByStatus: Record<string, number> = {
            pending: 20,
            confirmed: 18,
            preparing: 12,
            ready: 2,
        };

        const totalEstimate = estimatedByStatus[order.status] || 15;
        const remaining = Math.max(0, totalEstimate - (elapsedMin % totalEstimate));

        if (remaining <= 0) return 'Çok yakında!';
        if (remaining <= 2) return '~2 dakika';
        return `~${remaining} dakika`;
    };

    const estimatedTime = getEstimatedTime();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Sipariş Takip</h1>
                            <p className="text-sm text-gray-500">{order.orderNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Bağlantı durumu göstergesi */}
                        <div
                            title={socketConnected ? 'Canlı bağlantı aktif' : 'Polling ile takip ediliyor (15sn)'}
                            className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}
                        />
                        <button onClick={() => fetchOrder()} className="p-2 hover:bg-gray-100 rounded-full">
                            <RefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Status Card */}
            <section className="p-4">
                <Card className="overflow-hidden">
                    <div className={`${currentStatus.bgColor} p-6 text-center`}>
                        <currentStatus.icon className={`w-16 h-16 ${currentStatus.color} mx-auto mb-3`} />
                        <h2 className={`text-2xl font-bold ${currentStatus.color}`}>
                            {currentStatus.label}
                        </h2>
                        <p className="text-gray-600 mt-1">Masa {order.tableNumber}</p>

                        {/* Tahmini Süre */}
                        {estimatedTime && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/80 px-4 py-2 rounded-full">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Tahmini: {estimatedTime}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status Stepper */}
                    {!isCancelled && (
                        <CardBody className="py-6">
                            <div className="flex items-center justify-between relative">
                                {/* Progress Line */}
                                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                                    <div
                                        className="h-full bg-orange-500 transition-all duration-500"
                                        style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
                                    />
                                </div>

                                {/* Steps */}
                                {statusOrder.map((status, index) => {
                                    const isActive = index <= currentStatusIndex;
                                    const config = statusConfig[status];
                                    const Icon = config.icon;

                                    return (
                                        <div key={status} className="relative z-10 flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-orange-500' : 'bg-gray-200'
                                                    }`}
                                            >
                                                {isActive ? (
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Icon className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <span className={`text-xs mt-2 ${isActive ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBody>
                    )}
                </Card>
            </section>

            {/* Order Details */}
            <section className="px-4 mb-4">
                <Card>
                    <CardBody>
                        <h3 className="font-bold text-gray-900 mb-4">Sipariş Detayları</h3>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-orange-600">{item.quantity}×</span>
                                            <span className="font-medium">{item.itemName}</span>
                                        </div>
                                        {item.notes && (
                                            <p className="text-sm text-gray-500 ml-6">📝 {item.notes}</p>
                                        )}
                                    </div>
                                    <span className="text-gray-700">₺{item.subtotal}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="my-4" />

                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">Toplam</span>
                            <span className="text-xl font-bold text-orange-600">₺{order.totalAmount}</span>
                        </div>

                        <div className="mt-4 text-sm text-gray-500 space-y-1">
                            <p>📍 Restoran: {order.restaurant}</p>
                            <p>💳 Ödeme: {order.paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı (Masada)'}</p>
                            <p>⏰ Sipariş: {new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                        </div>
                    </CardBody>
                </Card>
            </section>

            {/* New Order Button */}
            <section className="px-4 pb-8">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                >
                    Yeni Sipariş Ver
                </Button>
            </section>
        </div>
    );
}

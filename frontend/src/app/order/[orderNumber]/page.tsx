'use client';

import { useEffect, useState } from 'react';
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

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await publicApi.get(`/public/orders/${orderNumber}`);
            setOrder(response.data.order);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Sipariş bulunamadı');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    // WebSocket for real-time updates
    useEffect(() => {
        const socket = socketService.connect();

        socketService.onOrderStatusUpdated((data) => {
            if (data.orderNumber === orderNumber) {
                setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
            }
        });

        return () => {
            socketService.removeAllListeners();
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
                    <button onClick={fetchOrder} className="p-2 hover:bg-gray-100 rounded-full">
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
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

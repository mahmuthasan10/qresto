'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import {
    ClipboardList,
    DollarSign,
    Users,
    TrendingUp,
    Clock,
} from 'lucide-react';
import api from '@/lib/api';
import { useSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

interface DashboardStats {
    todayOrders: number;
    todayRevenue: number;
    activeTables: number;
    averageOrderValue: number;
}

interface Order {
    id: number;
    orderNumber: string;
    tableNumber: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    totalAmount: number;
    createdAt: string;
    orderItems: Array<{
        itemName: string;
        quantity: number;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        todayOrders: 0,
        todayRevenue: 0,
        activeTables: 0,
        averageOrderValue: 0,
    });
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const socket = useSocket();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // WebSocket listeners for real-time updates
    useEffect(() => {
        if (!socket || !socket.connected) return;

        const handleNewOrder = (order: Order) => {
            setActiveOrders(prev => [order, ...prev]);
            setStats(prev => ({
                ...prev,
                todayOrders: prev.todayOrders + 1,
                todayRevenue: prev.todayRevenue + order.totalAmount,
            }));
            toast.success(`Yeni sipariş: ${order.orderNumber}`);
        };

        const handleOrderStatusUpdate = (data: { orderId: number; status: string }) => {
            setActiveOrders(prev =>
                prev.map(order =>
                    order.id === data.orderId
                        ? { ...order, status: data.status as Order['status'] }
                        : order
                ).filter(order =>
                    !['completed', 'cancelled'].includes(order.status)
                )
            );
        };

        socket.on('new_order', handleNewOrder);
        socket.on('order_status_updated', handleOrderStatusUpdate);

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('order_status_updated', handleOrderStatusUpdate);
        };
    }, [socket]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Fetch stats
            const statsResponse = await api.get('/restaurant/stats');
            const s = statsResponse.data.stats;
            setStats({
                todayOrders: s?.todayOrders || 0,
                todayRevenue: Number(s?.todayRevenue) || 0,
                activeTables: s?.activeTables || 0,
                averageOrderValue: Number(s?.averageOrderValue) || 0,
            });

            // Fetch active orders
            const ordersResponse = await api.get('/orders/active');
            setActiveOrders(ordersResponse.data.orders || []);
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            toast.error('Dashboard verileri yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

        if (diff < 1) return 'Az önce';
        if (diff < 60) return `${diff} dk önce`;
        return `${Math.floor(diff / 60)} saat önce`;
    };

    const getStatusBadge = (status: Order['status']) => {
        const statusMap = {
            pending: 'pending',
            confirmed: 'confirmed',
            preparing: 'preparing',
            ready: 'ready',
            completed: 'completed',
            cancelled: 'cancelled',
        } as const;
        return statusMap[status] || 'pending';
    };

    const statCards = [
        {
            title: 'Bugün Sipariş',
            value: stats.todayOrders,
            icon: ClipboardList,
            color: 'orange',
        },
        {
            title: 'Bugün Gelir',
            value: formatCurrency(stats.todayRevenue),
            icon: DollarSign,
            color: 'green',
        },
        {
            title: 'Aktif Masa',
            value: stats.activeTables,
            icon: Users,
            color: 'blue',
        },
        {
            title: 'Ort. Sipariş',
            value: formatCurrency(stats.averageOrderValue),
            icon: TrendingUp,
            color: 'purple',
        },
    ];

    const colorClasses = {
        orange: 'bg-orange-100 text-orange-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} variant="stat">
                            <CardBody className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            {/* Active Orders */}
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Aktif Siparişler</h2>
                    <span className="text-sm text-gray-500">
                        {activeOrders.length} aktif sipariş
                    </span>
                </CardHeader>
                <CardBody className="p-0">
                    {activeOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Henüz aktif sipariş yok</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {activeOrders.map((order) => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                            <Badge status={getStatusBadge(order.status)} />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Masa {order.tableNumber} • {order.orderItems.map(item => `${item.quantity}x ${item.itemName}`).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

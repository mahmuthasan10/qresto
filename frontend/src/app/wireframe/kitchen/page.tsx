'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Card, CardBody } from '@/components/ui';
import { Volume2, VolumeX, RefreshCw, ChefHat, Clock, User } from 'lucide-react';

type OrderStatus = 'pending' | 'preparing' | 'ready';

interface KitchenOrder {
    id: string;
    table: number;
    items: { name: string; quantity: number; note?: string }[];
    status: OrderStatus;
    createdAt: Date;
}

const initialOrders: KitchenOrder[] = [
    {
        id: 'ORD-001',
        table: 5,
        items: [
            { name: 'Margherita Pizza', quantity: 2, note: 'Ekstra peynir' },
            { name: 'Kola', quantity: 1 }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60000)
    },
    {
        id: 'ORD-002',
        table: 3,
        items: [
            { name: 'Caesar Salad', quantity: 1 },
            { name: 'Spaghetti', quantity: 2, note: 'Baharatsız' }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60000)
    },
    {
        id: 'ORD-003',
        table: 8,
        items: [
            { name: 'Tiramisu', quantity: 3 }
        ],
        status: 'preparing',
        createdAt: new Date(Date.now() - 12 * 60000)
    },
    {
        id: 'ORD-004',
        table: 1,
        items: [
            { name: 'Pizza Pepperoni', quantity: 1 },
            { name: 'Limonata', quantity: 2 }
        ],
        status: 'preparing',
        createdAt: new Date(Date.now() - 8 * 60000)
    },
    {
        id: 'ORD-005',
        table: 7,
        items: [
            { name: 'Bruschetta', quantity: 2 }
        ],
        status: 'ready',
        createdAt: new Date(Date.now() - 15 * 60000)
    },
];

export default function KitchenWireframe() {
    const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [, setTick] = useState(0);

    // Update relative times every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    const getRelativeTime = (date: Date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diff < 1) return 'Şimdi';
        if (diff === 1) return '1 dk önce';
        return `${diff} dk önce`;
    };

    const moveOrder = (orderId: string, newStatus: OrderStatus | 'completed') => {
        if (newStatus === 'completed') {
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const getOrdersByStatus = (status: OrderStatus) => orders.filter(o => o.status === status);

    const renderOrderCard = ({ order, nextStatus, buttonLabel }: { order: KitchenOrder; nextStatus: OrderStatus | 'completed'; buttonLabel: string }) => (
        <Card variant="order" className="mb-3">
            <CardBody className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold">{order.id.split('-')[1]}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className={`${(Date.now() - order.createdAt.getTime()) > 10 * 60000 ? 'text-red-500 font-bold' : ''
                            }`}>
                            {getRelativeTime(order.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="flex items-center gap-2 mb-3 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Masa {order.table}</span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-start gap-2">
                                <span className="text-lg font-bold text-orange-600 min-w-[28px]">
                                    {item.quantity}x
                                </span>
                                <div>
                                    <span className="font-medium">{item.name}</span>
                                    {item.note && (
                                        <p className="text-sm text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                                            ⚠️ {item.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <Button
                    className="w-full"
                    size="lg"
                    variant={order.status === 'ready' ? 'secondary' : 'primary'}
                    onClick={() => moveOrder(order.id, nextStatus)}
                >
                    {buttonLabel}
                </Button>
            </CardBody>
        </Card>
    );

    const renderColumn = ({
        title,
        status,
        bgColor,
        borderColor,
        nextStatus,
        buttonLabel
    }: {
        title: string;
        status: OrderStatus;
        bgColor: string;
        borderColor: string;
        nextStatus: OrderStatus | 'completed';
        buttonLabel: string;
    }) => {
        const columnOrders = getOrdersByStatus(status);

        return (
            <div className={`flex-1 ${bgColor} rounded-xl p-4 min-h-[calc(100vh-120px)]`}>
                <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${borderColor}`}>
                    <h2 className="text-lg font-bold">{title}</h2>
                    <Badge variant="count" count={columnOrders.length} />
                </div>
                <div className="space-y-3">
                    {columnOrders.map(order => (
                        <div key={order.id}>
                            {renderOrderCard({
                                order,
                                nextStatus,
                                buttonLabel
                            })}
                        </div>
                    ))}
                    {columnOrders.length === 0 && (
                        <div className="text-center text-gray-400 py-12">
                            <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Sipariş yok</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ChefHat className="w-8 h-8 text-orange-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Mutfak Ekranı</h1>
                        <p className="text-sm text-gray-400">Bella Italia</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                    </div>

                    <Button
                        variant={soundEnabled ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={!soundEnabled ? 'text-gray-400' : ''}
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>

                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Aktif: {orders.length} sipariş
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="p-4 flex gap-4 overflow-x-auto">
                {renderColumn({
                    title: "🔴 Yeni Siparişler",
                    status: "pending",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-500",
                    nextStatus: "preparing",
                    buttonLabel: "HAZIRLANIYOR"
                })}
                {renderColumn({
                    title: "🟡 Hazırlanıyor",
                    status: "preparing",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-500",
                    nextStatus: "ready",
                    buttonLabel: "HAZIR"
                })}
                {renderColumn({
                    title: "🟢 Hazır",
                    status: "ready",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-500",
                    nextStatus: "completed",
                    buttonLabel: "SERVİS EDİLDİ"
                })}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="fixed bottom-4 right-4 bg-gray-800 text-gray-400 text-xs px-4 py-2 rounded-lg">
                <span className="text-gray-500">Kısayollar:</span> 1-9 Sipariş Seç • Enter İlerlet • Esc İptal
            </div>
        </div>
    );
}

'use client';

import { KitchenOrder, KitchenOrderStatus } from '@/stores/kitchenStore';
import { Clock, User } from 'lucide-react';

interface OrderCardProps {
    order: KitchenOrder;
    isSelected?: boolean;
    onSelect?: () => void;
    onStatusUpdate: (status: KitchenOrderStatus) => void;
}

const statusConfig: Record<KitchenOrderStatus, {
    nextStatus: KitchenOrderStatus | null;
    buttonText: string;
    buttonColor: string;
}> = {
    pending: {
        nextStatus: 'confirmed',
        buttonText: 'ONAYLA',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    confirmed: {
        nextStatus: 'preparing',
        buttonText: 'HAZIRLANIYOR',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
    },
    preparing: {
        nextStatus: 'ready',
        buttonText: 'HAZIR',
        buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    ready: {
        // Mutfakta "SERVİS EDİLDİ" denince siparişi tamamlandı'ya çevir
        nextStatus: 'completed',
        buttonText: 'SERVİS EDİLDİ',
        buttonColor: 'bg-gray-600 hover:bg-gray-700',
    },
    completed: {
        nextStatus: null,
        buttonText: '',
        buttonColor: '',
    },
    cancelled: {
        nextStatus: null,
        buttonText: '',
        buttonColor: '',
    },
};


export default function OrderCard({ order, isSelected, onSelect, onStatusUpdate }: OrderCardProps) {
    const config = statusConfig[order.status];

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours} saat`;
    };

    const handleNextStatus = () => {
        if (config.nextStatus) {
            onStatusUpdate(config.nextStatus);
        }
    };

    return (
        <div
            onClick={onSelect}
            className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-orange-500 scale-[1.02]' : 'hover:shadow-xl'
                }`}
        >
            {/* Header */}
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <span className="text-2xl font-bold tracking-wider">
                    #{order.orderNumber}
                </span>
                <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{getTimeAgo(order.createdAt)}</span>
                </div>
            </div>

            {/* Table Info */}
            <div className="px-4 py-2 bg-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Masa {order.tableNumber}</span>
            </div>

            {/* Items */}
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                        <span className="text-2xl font-bold text-orange-600 min-w-[40px]">
                            {item.quantity}x
                        </span>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.itemName}</p>
                            {item.notes && (
                                <p className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1">
                                    📝 {item.notes}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            {config.nextStatus && (
                <div className="p-4 pt-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNextStatus();
                        }}
                        className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-colors ${config.buttonColor}`}
                    >
                        {config.buttonText}
                    </button>
                </div>
            )}
        </div>
    );
}

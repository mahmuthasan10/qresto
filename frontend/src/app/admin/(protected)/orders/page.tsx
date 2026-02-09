'use client';

import { useEffect, useState } from 'react';
import { useOrderStore, Order, OrderStatus } from '@/stores/orderStore';
import { useTableStore } from '@/stores/tableStore';
import { Button, Card, CardBody, CardHeader, Badge, Modal, Tabs, Input } from '@/components/ui';
import {
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    ChefHat,
    Bell
} from 'lucide-react';
import { useSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

const statusLabels: Record<OrderStatus, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
};

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
    const {
        orders,
        isLoading,
        filters,
        pagination,
        fetchOrders,
        updateOrderStatus,
        cancelOrder,
        setFilters,
        setPage,
        addOrder,
        updateOrder,
    } = useOrderStore();

    const { tables, fetchTables } = useTableStore();
    const socket = useSocket();

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchTables();
    }, [fetchOrders, fetchTables, filters, pagination.page]);

    // WebSocket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('new_order', (order: Order) => {
            addOrder(order);
            toast.success(`Yeni sipariş: ${order.orderNumber}`, {
                icon: '🔔',
            });
        });

        socket.on('order_status_updated', (data: { orderId: number; status: OrderStatus }) => {
            updateOrder(data.orderId, { status: data.status });
        });

        return () => {
            socket.off('new_order');
            socket.off('order_status_updated');
        };
    }, [socket, addOrder, updateOrder]);

    const handleSearch = () => {
        setFilters({ search: searchTerm });
    };

    const openDetailModal = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleStatusUpdate = async (status: OrderStatus) => {
        if (!selectedOrder) return;

        const success = await updateOrderStatus(selectedOrder.id, status);
        if (success) {
            toast.success(`Sipariş durumu güncellendi: ${statusLabels[status]}`);
            setSelectedOrder({ ...selectedOrder, status });
        } else {
            toast.error('Durum güncellenemedi');
        }
    };

    const openCancelModal = () => {
        setCancelReason('');
        setShowCancelModal(true);
    };

    const handleCancel = async () => {
        if (!selectedOrder || !cancelReason.trim()) {
            toast.error('İptal nedeni belirtmelisiniz');
            return;
        }

        const success = await cancelOrder(selectedOrder.id, cancelReason);
        if (success) {
            toast.success('Sipariş iptal edildi');
            setShowCancelModal(false);
            setShowDetailModal(false);
        } else {
            toast.error('İptal işlemi başarısız');
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
        if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('tr-TR');
    };

    const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
        const flow: Partial<Record<OrderStatus, OrderStatus>> = {
            pending: 'confirmed',
            confirmed: 'preparing',
            preparing: 'ready',
            ready: 'completed',
        };
        return flow[currentStatus] || null;
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const statusTabs = [
        { id: 'all', label: 'Tümü' },
        { id: 'pending', label: 'Beklemede' },
        { id: 'confirmed', label: 'Onaylanan' },
        { id: 'preparing', label: 'Hazırlanan' },
        { id: 'ready', label: 'Hazır' },
        { id: 'completed', label: 'Tamamlanan' },
        { id: 'cancelled', label: 'İptal' },
    ];

    if (isLoading && orders.length === 0) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Sipariş Yönetimi</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Status Tabs */}
                <div className="flex-1 overflow-x-auto">
                    <Tabs
                        tabs={statusTabs}
                        activeTab={filters.status || 'all'}
                        onTabChange={(id) => setFilters({ status: id as OrderStatus | 'all' })}
                        variant="pills"
                    />
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Sipariş no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9 w-40"
                        />
                    </div>
                    <select
                        value={filters.tableId || ''}
                        onChange={(e) => setFilters({ tableId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">Tüm Masalar</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>
                                Masa {table.tableNumber}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Sipariş bulunamadı</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 text-left text-sm text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Sipariş No</th>
                                    <th className="px-4 py-3 font-medium">Masa</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Ürünler</th>
                                    <th className="px-4 py-3 font-medium">Tutar</th>
                                    <th className="px-4 py-3 font-medium">Durum</th>
                                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Zaman</th>
                                    <th className="px-4 py-3 font-medium w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            Masa {order.tableNumber}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                                            {order.orderItems.map(item =>
                                                `${item.quantity}x ${item.itemName}`
                                            ).join(', ')}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">
                                            {formatTime(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDetailModal(order)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardBody>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Toplam {pagination.total} sipariş
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPage(pagination.page - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                            {pagination.page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= totalPages}
                            onClick={() => setPage(pagination.page + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Sipariş ${selectedOrder?.orderNumber}`}
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status & Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Masa {selectedOrder.tableNumber}</p>
                                <p className="text-xs text-gray-400">{formatDateTime(selectedOrder.createdAt)}</p>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedOrder.status]}`}>
                                {statusLabels[selectedOrder.status]}
                            </span>
                        </div>

                        {/* Items */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Ürünler</h4>
                            <div className="bg-gray-50 rounded-lg divide-y">
                                {selectedOrder.orderItems.map((item) => (
                                    <div key={item.id} className="p-3 flex justify-between">
                                        <div>
                                            <p className="font-medium">{item.quantity}x {item.itemName}</p>
                                            {item.notes && (
                                                <p className="text-sm text-orange-600">Not: {item.notes}</p>
                                            )}
                                        </div>
                                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {selectedOrder.customerNotes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-yellow-800">Müşteri Notu:</p>
                                <p className="text-sm text-yellow-700">{selectedOrder.customerNotes}</p>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-3 border-t">
                            <span className="font-medium">Toplam</span>
                            <span className="text-xl font-bold text-orange-600">
                                {formatCurrency(selectedOrder.totalAmount)}
                            </span>
                        </div>

                        {/* Actions */}
                        {!['completed', 'cancelled'].includes(selectedOrder.status) && (
                            <div className="flex gap-2 pt-2">
                                {getNextStatus(selectedOrder.status) && (
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate(getNextStatus(selectedOrder.status)!)}
                                    >
                                        {selectedOrder.status === 'pending' && <CheckCircle className="w-4 h-4 mr-2" />}
                                        {selectedOrder.status === 'confirmed' && <ChefHat className="w-4 h-4 mr-2" />}
                                        {selectedOrder.status === 'preparing' && <Bell className="w-4 h-4 mr-2" />}
                                        {selectedOrder.status === 'ready' && <CheckCircle className="w-4 h-4 mr-2" />}
                                        {statusLabels[getNextStatus(selectedOrder.status)!]}
                                    </Button>
                                )}
                                <Button variant="danger" onClick={openCancelModal}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    İptal
                                </Button>
                            </div>
                        )}

                        {/* Cancellation Info */}
                        {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-800">İptal Nedeni:</p>
                                <p className="text-sm text-red-700">{selectedOrder.cancellationReason}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cancel Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Sipariş İptali"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        <strong>{selectedOrder?.orderNumber}</strong> numaralı siparişi iptal etmek üzeresiniz.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            İptal Nedeni *
                        </label>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Seçin...</option>
                            <option value="Müşteri iptal etti">Müşteri iptal etti</option>
                            <option value="Ürün tükendi">Ürün tükendi</option>
                            <option value="Yanlış sipariş">Yanlış sipariş</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
                            Vazgeç
                        </Button>
                        <Button variant="danger" onClick={handleCancel}>
                            Siparişi İptal Et
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

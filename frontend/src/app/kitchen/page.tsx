'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useKitchenStore, KitchenOrderStatus, playNotificationSound } from '@/stores/kitchenStore';
import { useSocket, socketService } from '@/lib/socket';
import { OrderCard } from '@/components/kitchen';
import ConnectionIndicator from '@/components/ConnectionIndicator';
import { Volume2, VolumeX, RefreshCw, ChefHat, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function KitchenPage() {
    const {
        orders,
        selectedOrderId,
        soundEnabled,
        isLoading,
        lastUpdated,
        fetchOrders,
        updateOrderStatus,
        addOrder,
        updateOrder,
        removeOrder,
        selectOrder,
        toggleSound,
    } = useKitchenStore();

    const socket = useSocket();
    const refreshIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Memoized handlers
    const handleNewOrder = useCallback((order: any) => {
        addOrder(order);
        if (soundEnabled) {
            playNotificationSound().catch(console.error);
        }
        toast.success(`Yeni sipariş: #${order.orderNumber}`, {
            icon: '🔔',
            duration: 5000,
        });
    }, [soundEnabled, addOrder]);

    const handleStatusUpdate = useCallback((data: { orderId: number; status: KitchenOrderStatus }) => {
        if (data.status === 'completed' || data.status === 'cancelled') {
            removeOrder(data.orderId);
        } else {
            updateOrder(data.orderId, { status: data.status });
        }
    }, [updateOrder, removeOrder]);


    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();

        // Auto-refresh every 30 seconds as fallback
        refreshIntervalRef.current = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [fetchOrders]);

    // WebSocket listeners
    useEffect(() => {
        if (!socket || !socket.connected) return;

        socket.on('new_order', handleNewOrder);
        socket.on('order_status_updated', handleStatusUpdate);
        socket.on('connect', () => {
            console.log('Socket reconnected');
            fetchOrders();
        });

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('order_status_updated', handleStatusUpdate);
            socket.off('connect');
        };
    }, [socket, handleNewOrder, handleStatusUpdate, fetchOrders]);

    const handleStatusUpdateClick = async (orderId: number, currentStatus: KitchenOrderStatus) => {
        const statusFlow: Partial<Record<KitchenOrderStatus, KitchenOrderStatus>> = {
            pending: 'confirmed',
            confirmed: 'preparing',
            preparing: 'ready',
        };

        const nextStatus = statusFlow[currentStatus];
        if (!nextStatus) return;

        const success = await updateOrderStatus(orderId, nextStatus);
        if (success) {
            toast.success(`Sipariş durumu güncellendi`);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const orderId = parseInt(draggableId);
        const newStatus = destination.droppableId as KitchenOrderStatus;

        // Call API
        await updateOrderStatus(orderId, newStatus);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const visibleOrders = orders.filter(o =>
                ['pending', 'confirmed', 'preparing'].includes(o.status)
            );

            // Number keys 1-9 to select order
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (visibleOrders[index]) {
                    selectOrder(visibleOrders[index].id);
                }
            }

            // Enter to advance status
            if (e.key === 'Enter' && selectedOrderId) {
                const order = orders.find(o => o.id === selectedOrderId);
                if (order) {
                    handleStatusUpdateClick(order.id, order.status);
                }
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                selectOrder(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [orders, selectedOrderId, selectOrder]);


    // Group orders by status
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const formatTime = (date: Date | null) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => {
        const allOrders = [...pendingOrders, ...preparingOrders, ...readyOrders];
        if (allOrders.length === 0) {
            toast.error('Yazdırılacak sipariş yok');
            return;
        }

        const statusLabels: Record<string, string> = {
            pending: 'BEKLİYOR', confirmed: 'ONAYLANDI',
            preparing: 'HAZIRLANIYOR', ready: 'HAZIR'
        };

        const now = new Date().toLocaleString('tr-TR');
        const printContent = `
            <!DOCTYPE html>
            <html><head><meta charset="utf-8">
            <title>Mutfak Siparişleri</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
                h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
                .date { text-align: center; font-size: 10px; margin-bottom: 12px; color: #666; }
                .order { border: 2px solid #000; margin-bottom: 10px; padding: 8px; page-break-inside: avoid; }
                .order-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 6px; }
                .status { padding: 2px 6px; border: 1px solid #000; font-size: 10px; }
                .items { list-style: none; }
                .items li { padding: 2px 0; font-size: 13px; }
                .items .qty { font-weight: bold; }
                .items .note { font-size: 10px; color: #555; padding-left: 20px; }
                .time { font-size: 10px; color: #666; margin-top: 4px; }
                @media print { body { padding: 0; } }
            </style></head><body>
            <h1>MUTFAK SİPARİŞLERİ</h1>
            <div class="date">${now}</div>
            ${allOrders.map(order => `
                <div class="order">
                    <div class="order-header">
                        <span>#${order.orderNumber} - Masa ${order.tableNumber}</span>
                        <span class="status">${statusLabels[order.status] || order.status}</span>
                    </div>
                    <ul class="items">
                        ${order.orderItems.map(item => `
                            <li><span class="qty">${item.quantity}x</span> ${item.itemName}</li>
                            ${item.notes ? `<li class="note">📝 ${item.notes}</li>` : ''}
                        `).join('')}
                    </ul>
                    <div class="time">${new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `).join('')}
            </body></html>
        `;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    if (!isClient) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-900 text-white px-4 lg:px-6 py-3 lg:py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
                <div className="flex items-center gap-3 lg:gap-4">
                    <ChefHat className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />
                    <h1 className="text-lg lg:text-2xl font-bold">Mutfak Ekranı</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:gap-6">
                    {/* Order Count */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="bg-red-600 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg">
                            <span className="text-lg lg:text-2xl font-bold">{pendingOrders.length}</span>
                            <span className="text-xs lg:text-sm ml-1 lg:ml-2 hidden sm:inline">Bekleyen</span>
                        </div>
                        <div className="bg-orange-600 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg">
                            <span className="text-lg lg:text-2xl font-bold">{preparingOrders.length}</span>
                            <span className="text-xs lg:text-sm ml-1 lg:ml-2 hidden sm:inline">Hazırlanan</span>
                        </div>
                        <div className="bg-green-600 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg">
                            <span className="text-lg lg:text-2xl font-bold">{readyOrders.length}</span>
                            <span className="text-xs lg:text-sm ml-1 lg:ml-2 hidden sm:inline">Hazır</span>
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="text-gray-400 text-xs lg:text-sm hidden md:block">
                        Son güncelleme: {formatTime(lastUpdated)}
                    </div>

                    {/* Connection Status */}
                    <ConnectionIndicator showText={false} />

                    {/* Sound Toggle */}
                    <button
                        onClick={toggleSound}
                        className={`p-3 rounded-lg transition-colors ${soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                        title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                    >
                        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={() => fetchOrders()}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Yenile"
                    >
                        <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Print */}
                    <button
                        onClick={handlePrint}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Yazdır"
                    >
                        <Printer className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="p-3 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-88px)]">
                    {/* New Orders Column */}
                    <div className="flex flex-col min-h-[300px] lg:h-full">
                        <div className="bg-red-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
                            <h2 className="text-xl font-bold">YENİ SİPARİŞLER</h2>
                            <span className="bg-white text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                {pendingOrders.length}
                            </span>
                        </div>
                        <Droppable droppableId="confirmed">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-red-50 flex-1 p-4 rounded-b-xl overflow-y-auto space-y-4 border-2 border-t-0 border-red-200"
                                >
                                    {pendingOrders.map((order, index) => (
                                        <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        isSelected={selectedOrderId === order.id}
                                                        onSelect={() => selectOrder(order.id)}
                                                        onStatusUpdate={(status) => updateOrderStatus(order.id, status)}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {pendingOrders.length === 0 && (
                                        <div className="text-center text-gray-400 py-8">
                                            <p>Bekleyen sipariş yok</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Preparing Column */}
                    <div className="flex flex-col min-h-[300px] lg:h-full">
                        <div className="bg-orange-500 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
                            <h2 className="text-xl font-bold">HAZIRLANIYOR</h2>
                            <span className="bg-white text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                {preparingOrders.length}
                            </span>
                        </div>
                        <Droppable droppableId="preparing">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-orange-50 flex-1 p-4 rounded-b-xl overflow-y-auto space-y-4 border-2 border-t-0 border-orange-200"
                                >
                                    {preparingOrders.map((order, index) => (
                                        <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        isSelected={selectedOrderId === order.id}
                                                        onSelect={() => selectOrder(order.id)}
                                                        onStatusUpdate={(status) => updateOrderStatus(order.id, status)}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {preparingOrders.length === 0 && (
                                        <div className="text-center text-gray-400 py-8">
                                            <p>Hazırlanan sipariş yok</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Ready Column */}
                    <div className="flex flex-col min-h-[300px] lg:h-full">
                        <div className="bg-green-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
                            <h2 className="text-xl font-bold">HAZIR</h2>
                            <span className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                {readyOrders.length}
                            </span>
                        </div>
                        <Droppable droppableId="ready">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-green-50 flex-1 p-4 rounded-b-xl overflow-y-auto space-y-4 border-2 border-t-0 border-green-200"
                                >
                                    {readyOrders.map((order, index) => (
                                        <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        isSelected={selectedOrderId === order.id}
                                                        onSelect={() => selectOrder(order.id)}
                                                        onStatusUpdate={(status) => updateOrderStatus(order.id, status)}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {readyOrders.length === 0 && (
                                        <div className="text-center text-gray-400 py-8">
                                            <p>Servis bekleyen yok</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>

            {/* Keyboard Shortcuts Help */}
            <div className="hidden lg:block fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm opacity-70">
                <span className="font-medium">Kısayollar:</span> 1-9 Seç | Enter İlerlet | Esc İptal
            </div>
        </div>
    );
}

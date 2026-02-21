import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
    id: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    tableId: number;
    tableNumber: number;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod?: string;
    customerNotes?: string;
    orderItems: OrderItem[];
    createdAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
}

interface OrderFilters {
    status?: OrderStatus | 'all';
    tableId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}

interface OrderState {
    orders: Order[];
    activeOrders: Order[];
    isLoading: boolean;
    error: string | null;
    filters: OrderFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };

    // Actions
    fetchOrders: (filters?: OrderFilters) => Promise<void>;
    fetchActiveOrders: () => Promise<void>;
    updateOrderStatus: (id: number, status: OrderStatus) => Promise<boolean>;
    cancelOrder: (id: number, reason: string) => Promise<boolean>;
    setFilters: (filters: Partial<OrderFilters>) => void;
    setPage: (page: number) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: number, data: Partial<Order>) => void;
    clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    activeOrders: [],
    isLoading: false,
    error: null,
    filters: {
        status: 'all',
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
    },

    fetchOrders: async (filters?: OrderFilters) => {
        set({ isLoading: true, error: null });
        try {
            const currentFilters = filters || get().filters;
            const { page, limit } = get().pagination;

            const params: Record<string, string | number> = { page, limit };
            if (currentFilters.status && currentFilters.status !== 'all') {
                params.status = currentFilters.status;
            }
            if (currentFilters.tableId) params.tableId = currentFilters.tableId;
            if (currentFilters.startDate) params.startDate = currentFilters.startDate;
            if (currentFilters.endDate) params.endDate = currentFilters.endDate;
            if (currentFilters.search) params.search = currentFilters.search;

            const response = await api.get('/orders', { params });
            set({
                orders: response.data.orders || [],
                pagination: {
                    ...get().pagination,
                    total: response.data.total || 0,
                },
                isLoading: false,
            });
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Siparişler yüklenirken hata oluştu',
                isLoading: false,
            });
        }
    },

    fetchActiveOrders: async () => {
        try {
            const response = await api.get('/orders/active');
            set({ activeOrders: response.data.orders || [] });
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            console.error('Active orders fetch error:', error);
        }
    },

    updateOrderStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`/orders/${id}/status`, { status });
            const updatedOrder = response.data.order;

            set(state => ({
                orders: state.orders.map(order =>
                    order.id === id ? updatedOrder : order
                ),
                activeOrders: state.activeOrders.map(order =>
                    order.id === id ? updatedOrder : order
                ).filter(order =>
                    !['completed', 'cancelled'].includes(order.status)
                ),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Sipariş durumu güncellenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    cancelOrder: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/orders/${id}`, { data: { reason } });

            set(state => ({
                orders: state.orders.map(order =>
                    order.id === id
                        ? { ...order, status: 'cancelled' as OrderStatus, cancellationReason: reason }
                        : order
                ),
                activeOrders: state.activeOrders.filter(order => order.id !== id),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Sipariş iptal edilirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 },
        }));
    },

    setPage: (page) => {
        set(state => ({
            pagination: { ...state.pagination, page },
        }));
    },

    addOrder: (order) => {
        set(state => ({
            orders: [order, ...state.orders],
            activeOrders: [order, ...state.activeOrders],
        }));
    },

    updateOrder: (orderId, data) => {
        set(state => ({
            orders: state.orders.map(order =>
                order.id === orderId ? { ...order, ...data } : order
            ),
            activeOrders: state.activeOrders.map(order =>
                order.id === orderId ? { ...order, ...data } : order
            ),
        }));
    },

    clearError: () => set({ error: null }),
}));

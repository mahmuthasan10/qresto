import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export type KitchenOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';


export interface KitchenOrderItem {
    id: number;
    itemName: string;
    quantity: number;
    notes?: string;
}

export interface KitchenOrder {
    id: number;
    orderNumber: string;
    tableNumber: string;
    status: KitchenOrderStatus;
    orderItems: KitchenOrderItem[];
    createdAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    readyAt?: string;
}

interface KitchenState {
    orders: KitchenOrder[];
    selectedOrderId: number | null;
    soundEnabled: boolean;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    // Actions
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (orderId: number, status: KitchenOrderStatus) => Promise<boolean>;
    addOrder: (order: KitchenOrder) => void;
    updateOrder: (orderId: number, data: Partial<KitchenOrder>) => void;
    removeOrder: (orderId: number) => void;
    selectOrder: (orderId: number | null) => void;
    toggleSound: () => void;
    setLastUpdated: () => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
    orders: [],
    selectedOrderId: null,
    soundEnabled: true,
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/orders/kitchen');
            const orders = response.data.orders || [];
            set({
                orders,
                isLoading: false,
                lastUpdated: new Date()
            });
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Siparişler yüklenirken hata',
                isLoading: false,
            });
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });

            set(state => {
                // If completed or cancelled, remove from kitchen view
                if (status === 'ready') {
                    return {
                        orders: state.orders.map(order =>
                            order.id === orderId ? { ...order, status, readyAt: new Date().toISOString() } : order
                        ),
                        lastUpdated: new Date()
                    };
                }

                return {
                    orders: state.orders.map(order =>
                        order.id === orderId ? { ...order, status } : order
                    ),
                    lastUpdated: new Date()
                };
            });
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({ error: error.response?.data?.error || 'Durum güncellenemedi' });
            return false;
        }
    },

    addOrder: (order) => {
        set(state => ({
            orders: [order, ...state.orders],
            lastUpdated: new Date()
        }));
    },

    updateOrder: (orderId, data) => {
        set(state => ({
            orders: state.orders.map(order =>
                order.id === orderId ? { ...order, ...data } : order
            ),
            lastUpdated: new Date()
        }));
    },

    removeOrder: (orderId) => {
        set(state => ({
            orders: state.orders.filter(order => order.id !== orderId),
            lastUpdated: new Date()
        }));
    },

    selectOrder: (orderId) => {
        set({ selectedOrderId: orderId });
    },

    toggleSound: () => {
        set(state => ({ soundEnabled: !state.soundEnabled }));
    },

    setLastUpdated: () => {
        set({ lastUpdated: new Date() });
    },
}));

// Sound helper
// Sound helper
export const playNotificationSound = async () => {
    try {
        // Simple "ding" sound in base64 to avoid file dependency issues
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Sound playback failed', e);
    }
};

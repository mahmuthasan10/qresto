'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
}

class SocketService {
    private restaurantId: number | null = null;

    connect(): Socket {
        const s = getSocket();
        if (!s.connected) {
            s.connect();

            s.on('connect', () => {
                console.log('Socket connected:', s.id);
                if (this.restaurantId) {
                    this.joinRestaurant(this.restaurantId);
                }
            });

            s.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            s.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        return s;
    }

    disconnect(): void {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    joinRestaurant(restaurantId: number): void {
        this.restaurantId = restaurantId;
        if (socket?.connected) {
            socket.emit('join_restaurant', restaurantId);
        }
    }

    leaveRestaurant(restaurantId: number): void {
        if (socket?.connected) {
            socket.emit('leave_restaurant', restaurantId);
        }
        this.restaurantId = null;
    }

    onNewOrder(callback: (data: any) => void): void {
        socket?.on('new_order', callback);
    }

    onOrderStatusUpdated(callback: (data: any) => void): void {
        socket?.on('order_status_updated', callback);
    }

    onMenuUpdated(callback: (data: any) => void): void {
        socket?.on('menu_updated', callback);
    }

    onSessionExpired(callback: (data: any) => void): void {
        socket?.on('session_expired', callback);
    }

    removeAllListeners(): void {
        socket?.removeAllListeners();
    }
}

export const socketService = new SocketService();

// React hook for socket access
export function useSocket(): Socket | null {
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
    const { restaurant, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && restaurant?.id) {
            const s = socketService.connect();
            socketService.joinRestaurant(restaurant.id);
            setSocketInstance(s);

            return () => {
                socketService.leaveRestaurant(restaurant.id);
            };
        }
    }, [isAuthenticated, restaurant?.id]);

    return socketInstance;
}


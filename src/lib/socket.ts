'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private restaurantId: number | null = null;

    connect(): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
                if (this.restaurantId) {
                    this.joinRestaurant(this.restaurantId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRestaurant(restaurantId: number): void {
        this.restaurantId = restaurantId;
        if (this.socket?.connected) {
            this.socket.emit('join_restaurant', restaurantId);
        }
    }

    leaveRestaurant(restaurantId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_restaurant', restaurantId);
        }
        this.restaurantId = null;
    }

    onNewOrder(callback: (data: any) => void): void {
        this.socket?.on('new_order', callback);
    }

    onOrderStatusUpdated(callback: (data: any) => void): void {
        this.socket?.on('order_status_updated', callback);
    }

    onMenuUpdated(callback: (data: any) => void): void {
        this.socket?.on('menu_updated', callback);
    }

    onSessionExpired(callback: (data: any) => void): void {
        this.socket?.on('session_expired', callback);
    }

    removeAllListeners(): void {
        this.socket?.removeAllListeners();
    }
}

export const socketService = new SocketService();

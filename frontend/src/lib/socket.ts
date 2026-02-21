'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });
    }
    return socket;
}

class SocketService {
    private restaurantId: number | null = null;
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    connect(): Socket {
        const s = getSocket();
        if (!s.connected) {
            this.notifyStatus('connecting');
            s.connect();

            s.on('connect', () => {
                console.log('Socket connected:', s.id);
                this.notifyStatus('connected');
                if (this.restaurantId) {
                    this.joinRestaurant(this.restaurantId);
                }
            });

            s.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                this.notifyStatus('disconnected');
            });

            s.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.notifyStatus('error');
            });

            s.on('reconnect', (attemptNumber) => {
                console.log('Socket reconnected after', attemptNumber, 'attempts');
                this.notifyStatus('connected');
            });

            s.on('reconnect_attempt', (attemptNumber) => {
                console.log('Reconnection attempt:', attemptNumber);
                this.notifyStatus('connecting');
            });

            // Heartbeat/ping every 25 seconds (tek bir interval)
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }
            this.heartbeatInterval = setInterval(() => {
                if (s.connected) {
                    s.emit('ping');
                }
            }, 25000);
        }

        return s;
    }

    disconnect(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (socket) {
            socket.disconnect();
            socket = null;
            this.notifyStatus('disconnected');
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

    // Status listener management
    onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        this.statusListeners.add(callback);
        return () => this.statusListeners.delete(callback);
    }

    private notifyStatus(status: ConnectionStatus): void {
        this.statusListeners.forEach(listener => listener(status));
    }

    getStatus(): ConnectionStatus {
        if (!socket) return 'disconnected';
        if (socket.connected) return 'connected';
        return 'disconnected';
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

// React hook for socket access with connection status
// Uses useSyncExternalStore to avoid synchronous setState in useEffect
export function useSocket(): Socket | null {
    const { restaurant, isAuthenticated } = useAuthStore();

    // Manage connection lifecycle
    useEffect(() => {
        if (isAuthenticated && restaurant?.id) {
            socketService.connect();
            socketService.joinRestaurant(restaurant.id);

            return () => {
                socketService.leaveRestaurant(restaurant.id);
            };
        }
    }, [isAuthenticated, restaurant?.id]);

    // Subscribe to socket status changes and read current socket reference
    const subscribe = useCallback((callback: () => void) => {
        return socketService.onStatusChange(callback);
    }, []);

    const getSnapshot = useCallback((): Socket | null => {
        return socket;
    }, []);

    const getServerSnapshot = useCallback((): Socket | null => {
        return null;
    }, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Hook for connection status
export function useSocketStatus(): ConnectionStatus {
    const [status, setStatus] = useState<ConnectionStatus>(socketService.getStatus());

    useEffect(() => {
        const unsubscribe = socketService.onStatusChange(setStatus);
        return unsubscribe;
    }, []);

    return status;
}

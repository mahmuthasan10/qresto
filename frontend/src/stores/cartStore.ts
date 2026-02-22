import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: number;
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    notes?: string;
}

interface CartState {
    items: CartItem[];
    sessionToken: string | null;
    tableNumber: string | null;
    tableQrCode: string | null;
    restaurantName: string | null;
    expiresAt: Date | null;
    _hasHydrated: boolean;

    setHasHydrated: (v: boolean) => void;
    addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
    removeItem: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    updateNotes: (menuItemId: number, notes: string) => void;
    clearCart: () => void;
    setSession: (token: string, tableNumber: string, restaurantName: string, expiresAt: Date, qrCode?: string) => void;
    clearSession: () => void;
    ensureTable: (qrCode: string) => boolean;
    getTotalAmount: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            sessionToken: null,
            tableNumber: null,
            tableQrCode: null,
            restaurantName: null,
            expiresAt: null,
            _hasHydrated: false,

            setHasHydrated: (v) => set({ _hasHydrated: v }),

            addItem: (item) => {
                const items = get().items;
                const existingIndex = items.findIndex((i) => i.menuItemId === item.menuItemId);

                if (existingIndex > -1) {
                    const newItems = [...items];
                    newItems[existingIndex].quantity += 1;
                    set({ items: newItems });
                } else {
                    set({
                        items: [
                            ...items,
                            { ...item, id: Date.now(), quantity: 1 },
                        ],
                    });
                }
            },

            removeItem: (menuItemId) => {
                set({
                    items: get().items.filter((item) => item.menuItemId !== menuItemId),
                });
            },

            updateQuantity: (menuItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(menuItemId);
                    return;
                }

                const items = get().items.map((item) =>
                    item.menuItemId === menuItemId ? { ...item, quantity } : item
                );
                set({ items });
            },

            updateNotes: (menuItemId, notes) => {
                const items = get().items.map((item) =>
                    item.menuItemId === menuItemId ? { ...item, notes } : item
                );
                set({ items });
            },

            clearCart: () => set({ items: [] }),

            setSession: (token, tableNumber, restaurantName, expiresAt, qrCode) => {
                set({
                    sessionToken: token,
                    tableNumber,
                    restaurantName,
                    expiresAt,
                    ...(qrCode ? { tableQrCode: qrCode } : {}),
                });
            },

            clearSession: () => {
                set({
                    items: [],
                    sessionToken: null,
                    tableNumber: null,
                    tableQrCode: null,
                    restaurantName: null,
                    expiresAt: null,
                });
            },

            ensureTable: (qrCode) => {
                const state = get();
                const currentQr = state.tableQrCode;

                // Case 1: Different QR → full reset for the new table
                if (currentQr && currentQr !== qrCode) {
                    set({
                        items: [],
                        sessionToken: null,
                        tableNumber: null,
                        tableQrCode: qrCode,
                        restaurantName: null,
                        expiresAt: null,
                    });
                    return true; // cleared
                }

                // Case 2: No stored QR (first visit or cleared storage)
                // If there are stale items from a previous persist, wipe them
                if (!currentQr) {
                    set({
                        items: [],
                        sessionToken: null,
                        tableNumber: null,
                        tableQrCode: qrCode,
                        restaurantName: null,
                        expiresAt: null,
                    });
                    return true; // cleared
                }

                // Case 3: Same QR → only clear if session expired
                const expiresAt = state.expiresAt;
                if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
                    set({
                        items: [],
                        sessionToken: null,
                        tableNumber: null,
                        restaurantName: null,
                        expiresAt: null,
                    });
                    return true; // cleared
                }

                return false; // not cleared, same valid session
            },

            getTotalAmount: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
                sessionToken: state.sessionToken,
                tableNumber: state.tableNumber,
                tableQrCode: state.tableQrCode,
                restaurantName: state.restaurantName,
                expiresAt: state.expiresAt,
            }),
            onRehydrateStorage: () => {
                return (_state, error) => {
                    if (error) {
                        console.warn('Cart hydration failed, resetting store:', error);
                        useCartStore.setState({
                            items: [],
                            sessionToken: null,
                            tableNumber: null,
                            tableQrCode: null,
                            restaurantName: null,
                            expiresAt: null,
                            _hasHydrated: true,
                        });
                    } else {
                        useCartStore.setState({ _hasHydrated: true });
                    }
                };
            },
        }
    )
);

/**
 * SSR-safe hook: returns false on server and during hydration,
 * true only after Zustand has finished rehydrating from localStorage.
 * Prevents hydration mismatch between server-rendered HTML and client state.
 */
export function useCartHydrated(): boolean {
    // Subscribe to _hasHydrated directly — avoids an extra re-render cycle
    return useCartStore((s) => s._hasHydrated);
}
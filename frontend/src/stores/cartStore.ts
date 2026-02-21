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

    addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
    removeItem: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    updateNotes: (menuItemId: number, notes: string) => void;
    clearCart: () => void;
    setSession: (token: string, tableNumber: string, restaurantName: string, expiresAt: Date, qrCode?: string) => void;
    clearSession: () => void;
    ensureTable: (qrCode: string) => void;
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
                const currentQr = get().tableQrCode;
                if (currentQr && currentQr !== qrCode) {
                    // Farklı masa QR'ı → sepeti ve oturumu temizle
                    set({
                        items: [],
                        sessionToken: null,
                        tableNumber: null,
                        tableQrCode: qrCode,
                        restaurantName: null,
                        expiresAt: null,
                    });
                } else if (!currentQr) {
                    set({ tableQrCode: qrCode });
                }
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
        }
    )
);

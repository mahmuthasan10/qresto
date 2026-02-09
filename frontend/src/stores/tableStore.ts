import { create } from 'zustand';
import api from '@/lib/api';

interface Table {
    id: number;
    tableNumber: number;
    tableName?: string;
    qrCode: string;
    capacity: number;
    isActive: boolean;
    createdAt: string;
}

interface TableState {
    tables: Table[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTables: () => Promise<void>;
    addTable: (data: Partial<Table>) => Promise<boolean>;
    updateTable: (id: number, data: Partial<Table>) => Promise<boolean>;
    deleteTable: (id: number) => Promise<boolean>;
    regenerateQR: (id: number) => Promise<string | null>;
    getQRCode: (id: number) => Promise<string | null>;
    clearError: () => void;
}

export const useTableStore = create<TableState>((set, get) => ({
    tables: [],
    isLoading: false,
    error: null,

    fetchTables: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/tables');
            set({ tables: response.data.tables || [], isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Masalar yüklenirken hata oluştu',
                isLoading: false,
            });
        }
    },

    addTable: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/tables', data);
            const newTable = response.data.table;
            set(state => ({
                tables: [...state.tables, newTable],
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Masa eklenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    updateTable: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/tables/${id}`, data);
            const updatedTable = response.data.table;
            set(state => ({
                tables: state.tables.map(table =>
                    table.id === id ? updatedTable : table
                ),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Masa güncellenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    deleteTable: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/tables/${id}`);
            set(state => ({
                tables: state.tables.filter(table => table.id !== id),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Masa silinirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    regenerateQR: async (id) => {
        try {
            const response = await api.post(`/tables/${id}/qr/regenerate`);
            const newQrCode = response.data.qrCode;
            set(state => ({
                tables: state.tables.map(table =>
                    table.id === id ? { ...table, qrCode: newQrCode } : table
                ),
            }));
            return newQrCode;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'QR kod yenileme başarısız',
            });
            return null;
        }
    },

    getQRCode: async (id) => {
        try {
            const response = await api.get(`/tables/${id}/qr`);
            return response.data.qrCodeUrl || response.data.qrCode;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'QR kod alınamadı',
            });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));

import { create } from 'zustand';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface Category {
    id: number;
    name: string;
    nameEn?: string;
    displayOrder: number;
    icon?: string;
    isActive: boolean;
}

interface MenuItem {
    id: number;
    categoryId: number;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    isFeatured: boolean;
    allergens: string[];
    dietaryInfo: string[];
    preparationTime?: number;
    displayOrder: number;
}

interface MenuState {
    categories: Category[];
    menuItems: MenuItem[];
    isLoading: boolean;
    error: string | null;
    selectedCategory: number | null;

    // Actions
    fetchCategories: () => Promise<void>;
    fetchMenuItems: (categoryId?: number) => Promise<void>;
    addCategory: (data: Partial<Category>) => Promise<boolean>;
    updateCategory: (id: number, data: Partial<Category>) => Promise<boolean>;
    deleteCategory: (id: number) => Promise<boolean>;
    addMenuItem: (data: Partial<MenuItem>) => Promise<boolean>;
    updateMenuItem: (id: number, data: Partial<MenuItem>) => Promise<boolean>;
    deleteMenuItem: (id: number) => Promise<boolean>;
    toggleItemAvailability: (id: number) => Promise<boolean>;
    uploadMenuItemImage: (id: number, file: File) => Promise<boolean>;
    deleteMenuItemImage: (id: number) => Promise<boolean>;
    setSelectedCategory: (id: number | null) => void;
    clearError: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
    categories: [],
    menuItems: [],
    isLoading: false,
    error: null,
    selectedCategory: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/categories');
            set({ categories: response.data.categories || [], isLoading: false });
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Kategoriler yüklenirken hata oluştu',
                isLoading: false,
            });
        }
    },

    fetchMenuItems: async (categoryId?: number) => {
        set({ isLoading: true, error: null });
        try {
            const params = categoryId ? { categoryId } : {};
            const response = await api.get('/menu-items', { params });
            set({ menuItems: response.data.menuItems || [], isLoading: false });
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Menü öğeleri yüklenirken hata oluştu',
                isLoading: false,
            });
        }
    },

    addCategory: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/categories', data);
            const newCategory = response.data.category;
            set(state => ({
                categories: [...state.categories, newCategory],
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Kategori eklenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    updateCategory: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/categories/${id}`, data);
            const updatedCategory = response.data.category;
            set(state => ({
                categories: state.categories.map(cat =>
                    cat.id === id ? updatedCategory : cat
                ),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Kategori güncellenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/categories/${id}`);
            set(state => ({
                categories: state.categories.filter(cat => cat.id !== id),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Kategori silinirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    addMenuItem: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/menu-items', data);
            const newItem = response.data.menuItem;
            set(state => ({
                menuItems: [...state.menuItems, newItem],
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Ürün eklenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    updateMenuItem: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/menu-items/${id}`, data);
            const updatedItem = response.data.menuItem;
            set(state => ({
                menuItems: state.menuItems.map(item =>
                    item.id === id ? updatedItem : item
                ),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Ürün güncellenirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    deleteMenuItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/menu-items/${id}`);
            set(state => ({
                menuItems: state.menuItems.filter(item => item.id !== id),
                isLoading: false,
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Ürün silinirken hata oluştu',
                isLoading: false,
            });
            return false;
        }
    },

    toggleItemAvailability: async (id) => {
        try {
            const response = await api.patch(`/menu-items/${id}/toggle-availability`);
            const updatedItem = response.data.menuItem;
            set(state => ({
                menuItems: state.menuItems.map(item =>
                    item.id === id ? updatedItem : item
                ),
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Durum değiştirilirken hata oluştu',
            });
            return false;
        }
    },

    uploadMenuItemImage: async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post(`/menu-items/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = response.data.imageUrl;
            set(state => ({
                menuItems: state.menuItems.map(item =>
                    item.id === id ? { ...item, imageUrl } : item
                ),
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Resim yüklenirken hata oluştu',
            });
            return false;
        }
    },

    deleteMenuItemImage: async (id) => {
        try {
            await api.delete(`/menu-items/${id}/image`);
            set(state => ({
                menuItems: state.menuItems.map(item =>
                    item.id === id ? { ...item, imageUrl: undefined } : item
                ),
            }));
            return true;
        } catch (unknownError) {
            const error = unknownError as AxiosError<{ error: string }>;
            set({
                error: error.response?.data?.error || 'Resim silinirken hata oluştu',
            });
            return false;
        }
    },

    setSelectedCategory: (id) => set({ selectedCategory: id }),
    clearError: () => set({ error: null }),
}));

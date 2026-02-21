import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    latitude: number;
    longitude: number;
    locationRadius: number;
    sessionTimeout: number;
    logoUrl?: string;
    subscriptionPlan: string;
    themeSettings?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        borderRadius?: string;
    };
}

interface AuthState {
    restaurant: Restaurant | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
    updateRestaurant: (data: Partial<Restaurant>) => void;
    clearError: () => void;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    latitude: number;
    longitude: number;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            restaurant: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { restaurant, accessToken, refreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        restaurant,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return true;
                } catch (unknownError) {
                    const error = unknownError as AxiosError<{ error: string }>;
                    set({
                        error: error.response?.data?.error || 'Giriş yapılırken hata oluştu',
                        isLoading: false,
                    });
                    return false;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', data);
                    const { restaurant, accessToken, refreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        restaurant,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return true;
                } catch (unknownError) {
                    const error = unknownError as AxiosError<{ error: string }>;
                    set({
                        error: error.response?.data?.error || 'Kayıt olurken hata oluştu',
                        isLoading: false,
                    });
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    restaurant: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            updateRestaurant: (data: Partial<Restaurant>) => {
                const current = get().restaurant;
                if (current) {
                    set({ restaurant: { ...current, ...data } });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                restaurant: state.restaurant,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

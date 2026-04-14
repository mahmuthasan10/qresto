'use client';

import { useState, useCallback } from 'react';
import { publicApi } from '@/lib/api';
import type { Restaurant, TableInfo, Category, MenuItem } from './types';

interface MenuData {
    restaurant: Restaurant | null;
    table: TableInfo | null;
    categories: Category[];
    featuredItems: MenuItem[];
    loading: boolean;
    error: string | null;
    fetchMenu: () => Promise<void>;
}

export function useMenuData(tableQR: string): MenuData {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [table, setTable] = useState<TableInfo | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await publicApi.get(`/public/menu/${tableQR}`);
            const data = response.data;

            setRestaurant(data.restaurant);
            setTable(data.table);
            setCategories(data.categories);
            setFeaturedItems(data.featuredItems);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || 'Menü yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [tableQR]);

    return { restaurant, table, categories, featuredItems, loading, error, fetchMenu };
}

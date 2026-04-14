export interface MenuItem {
    id: number;
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
}

export interface Category {
    id: number;
    name: string;
    nameEn?: string;
    description?: string;
    icon?: string;
    menuItems: MenuItem[];
}

export interface Restaurant {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    latitude: string;
    longitude: string;
    locationRadius: number;
    sessionTimeout: number;
    themeSettings?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        borderRadius?: string;
    };
}

export interface TableInfo {
    id: number;
    tableNumber: string;
    tableName?: string;
}

export type Lang = 'tr' | 'en';
export type TranslateFn = (tr: string, en?: string | null) => string;

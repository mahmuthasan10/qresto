'use client';

import Image from 'next/image';
import { Globe, Lock, Gift } from 'lucide-react';
import SessionTimer from '@/components/SessionTimer';
import type { Restaurant, TableInfo, Category, Lang, TranslateFn } from './types';

interface MenuHeaderProps {
    restaurant: Restaurant | null;
    table: TableInfo | null;
    lang: Lang;
    isTreatMode: boolean;
    activeCategory: number | null;
    categories: Category[];
    hydrated: boolean;
    sessionToken: string | null;
    t: TranslateFn;
    onLangToggle: () => void;
    onCategorySelect: (id: number) => void;
    onTreatModeToggle: () => void;
    onTableSelectionOpen: () => void;
    onSessionExpire: () => void;
}

export function MenuHeader({
    restaurant,
    table,
    lang,
    isTreatMode,
    activeCategory,
    categories,
    hydrated,
    sessionToken,
    t,
    onLangToggle,
    onCategorySelect,
    onTreatModeToggle,
    onTableSelectionOpen,
    onSessionExpire,
}: MenuHeaderProps) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 transition-colors duration-300">
            <div className={`px-4 py-3 ${isTreatMode ? 'bg-purple-50' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {restaurant?.logoUrl ? (
                            <Image
                                src={restaurant.logoUrl}
                                alt={restaurant.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">
                                    {restaurant?.name?.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-gray-900">{restaurant?.name}</h1>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Lock className="w-3 h-3 text-orange-500" />
                                <span>{lang === 'tr' ? 'Masa' : 'Table'} {table?.tableNumber}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onLangToggle}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {lang === 'tr' ? 'EN' : 'TR'}
                        </button>
                        {hydrated && sessionToken && (
                            <SessionTimer onExpire={onSessionExpire} />
                        )}
                    </div>
                </div>
            </div>

            {/* Treat Mode Banner */}
            {isTreatMode && (
                <div className="bg-purple-600 text-white px-4 py-2 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">İkram Modu Aktif</span>
                    </div>
                    <button
                        onClick={onTreatModeToggle}
                        className="text-purple-100 hover:text-white underline text-xs"
                    >
                        İptal
                    </button>
                </div>
            )}

            {/* Category Tabs */}
            <div className="overflow-x-auto scrollbar-hide border-t bg-white">
                <div className="flex px-4 py-2 gap-2">
                    {/* Treat Button */}
                    <button
                        onClick={isTreatMode ? onTreatModeToggle : onTableSelectionOpen}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1 border-2
                            ${isTreatMode
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'
                            }`}
                    >
                        <Gift className="w-4 h-4" />
                        {isTreatMode ? 'İkramı İptal Et' : 'İkram Et'}
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategorySelect(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                activeCategory === cat.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {cat.icon && <span className="mr-1">{cat.icon}</span>}
                            {t(cat.name, cat.nameEn)}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}

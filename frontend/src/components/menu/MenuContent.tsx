'use client';

import Image from 'next/image';
import { Search, X, Plus, AlertTriangle, Clock, Gift, ShoppingCart } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';
import type { Category, MenuItem, TranslateFn } from './types';

interface MenuContentProps {
    categories: Category[];
    featuredItems: MenuItem[];
    searchQuery: string;
    activeCategory: number | null;
    isTreatMode: boolean;
    lang: 'tr' | 'en';
    t: TranslateFn;
    hydrated: boolean;
    sessionToken: string | null;
    totalItems: number;
    totalAmount: number;
    onItemSelect: (item: MenuItem) => void;
    onQuickAdd: (item: MenuItem) => void;
    onSearchChange: (q: string) => void;
    onCartClick: () => void;
}

export function MenuContent({
    categories,
    featuredItems,
    searchQuery,
    activeCategory,
    isTreatMode,
    lang,
    t,
    hydrated,
    totalItems,
    totalAmount,
    onItemSelect,
    onQuickAdd,
    onSearchChange,
    onCartClick,
}: MenuContentProps) {
    return (
        <>
            {/* Search Bar */}
            <div className="px-4 pt-3 pb-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={lang === 'tr' ? 'Menüde ara...' : 'Search menu...'}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Featured Items */}
            {!isTreatMode && featuredItems.length > 0 && !searchQuery && (
                <section className="px-4 py-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                        {lang === 'tr' ? '⭐ Öne Çıkanlar' : '⭐ Featured'}
                    </h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {featuredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onItemSelect(item)}
                                className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="h-24 bg-gray-100 relative">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            priority
                                            className="object-cover"
                                            sizes="160px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="font-medium text-sm truncate">{t(item.name, item.nameEn)}</p>
                                    <p className="text-orange-600 font-bold">₺{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Menu Items by Category */}
            <section className="px-4 pb-4 mt-4">
                {categories && categories.length > 0 ? (
                    <>
                        {categories
                            .filter((cat) => activeCategory === null || cat.id === activeCategory)
                            .map((category) => {
                                const filteredItems = searchQuery
                                    ? category.menuItems.filter((item) => {
                                        const q = searchQuery.toLowerCase();
                                        return (
                                            item.name.toLowerCase().includes(q) ||
                                            (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
                                            (item.description && item.description.toLowerCase().includes(q)) ||
                                            (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q))
                                        );
                                    })
                                    : category.menuItems;

                                if (searchQuery && filteredItems.length === 0) return null;

                                return (
                                    <div key={category.id} className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            {t(category.name, category.nameEn)}
                                        </h3>
                                        <div className="space-y-3">
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map((item) => (
                                                    <Card
                                                        key={item.id}
                                                        hoverable
                                                        className={`overflow-hidden transition-all ${isTreatMode ? 'ring-2 ring-purple-400 bg-purple-50/50' : ''}`}
                                                        onClick={() => onItemSelect(item)}
                                                    >
                                                        <CardBody className="p-0">
                                                            <div className="flex">
                                                                <div className="flex-1 p-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900">
                                                                                {t(item.name, item.nameEn)}
                                                                            </h4>
                                                                            {(item.description || (lang === 'en' && item.nameEn)) && (
                                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                                    {t(item.description || '', item.descriptionEn)}
                                                                                </p>
                                                                            )}
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <span className={`font-bold ${isTreatMode ? 'text-purple-600' : 'text-orange-600'}`}>
                                                                                    ₺{item.price}
                                                                                </span>
                                                                                {item.preparationTime && (
                                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                                        <Clock className="w-3 h-3" />
                                                                                        {item.preparationTime} dk
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {item.dietaryInfo.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                                    {item.dietaryInfo.map((info) => (
                                                                                        <span key={info} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                                            {info}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* Image + Quick Add Button */}
                                                                <div className="w-24 relative">
                                                                    {item.imageUrl ? (
                                                                        <Image
                                                                            src={item.imageUrl}
                                                                            alt={item.name}
                                                                            fill
                                                                            className="object-cover"
                                                                            sizes="96px"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">
                                                                            🍽️
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onQuickAdd(item);
                                                                        }}
                                                                        className={`absolute bottom-2 right-2 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg transition-colors ${
                                                                            isTreatMode
                                                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                                                : 'bg-orange-500 hover:bg-orange-600'
                                                                        }`}
                                                                    >
                                                                        {isTreatMode ? <Gift className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p className="text-sm">
                                                        {lang === 'tr' ? 'Bu kategoride ürün bulunamadı' : 'No items in this category'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }).filter(Boolean)}

                        {/* Search no results */}
                        {searchQuery && categories
                            .filter((cat) => activeCategory === null || cat.id === activeCategory)
                            .every((cat) => {
                                const q = searchQuery.toLowerCase();
                                return cat.menuItems.every((item) => !(
                                    item.name.toLowerCase().includes(q) ||
                                    (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
                                    (item.description && item.description.toLowerCase().includes(q)) ||
                                    (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q))
                                ));
                            }) && (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">
                                    {lang === 'tr' ? `"${searchQuery}" için sonuç bulunamadı` : `No results for "${searchQuery}"`}
                                </p>
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="mt-3 text-orange-500 text-sm font-medium hover:underline"
                                >
                                    {lang === 'tr' ? 'Aramayı Temizle' : 'Clear Search'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                            {lang === 'tr' ? 'Menü bulunamadı' : 'Menu not found'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {lang === 'tr' ? 'Lütfen geçerli bir QR kod kullanın' : 'Please use a valid QR code'}
                        </p>
                    </div>
                )}
            </section>

            {/* Fixed Bottom Cart Bar */}
            {hydrated && !isTreatMode && totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                    <button
                        onClick={onCartClick}
                        className="w-full bg-orange-500 text-white py-4 rounded-xl flex items-center justify-between px-6 hover:bg-orange-600 transition-colors active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            </div>
                            <span className="font-medium">{lang === 'tr' ? 'Siparişi Tamamla' : 'Checkout'}</span>
                        </div>
                        <span className="font-bold text-lg">₺{totalAmount.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </>
    );
}

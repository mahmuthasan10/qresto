'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { publicApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button, Card, CardBody, Modal } from '@/components/ui';
import SessionTimer from '@/components/SessionTimer';
import { TableSelectionModal } from '@/components/Treats/TableSelectionModal';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { ShoppingCart, Plus, Minus, Clock, MapPin, X, AlertTriangle, Gift, Lock, Globe, Search } from 'lucide-react';

interface MenuItem {
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

interface Category {
    id: number;
    name: string;
    nameEn?: string;
    description?: string;
    icon?: string;
    menuItems: MenuItem[];
}

interface Restaurant {
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

interface TableInfo {
    id: number;
    tableNumber: string;
    tableName?: string;
}

export default function MenuPage() {
    const params = useParams();
    const router = useRouter();
    const tableQR = params.qrCode as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [table, setTable] = useState<TableInfo | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemNote, setItemNote] = useState('');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [sessionStarting, setSessionStarting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Language
    const [lang, setLang] = useState<'tr' | 'en'>('tr');

    useEffect(() => {
        const saved = localStorage.getItem('qresto-lang');
        if (saved === 'en') setLang('en');
    }, []);

    const toggleLang = () => {
        const next = lang === 'tr' ? 'en' : 'tr';
        setLang(next);
        localStorage.setItem('qresto-lang', next);
    };

    const t = (tr: string, en?: string | null) => {
        if (lang === 'en' && en) return en;
        return tr;
    };

    // Treat System State
    const [isTreatMode, setIsTreatMode] = useState(false);
    const [showTableSelection, setShowTableSelection] = useState(false);
    const [targetTableId, setTargetTableId] = useState<number | null>(null);
    const [targetTableNumber, setTargetTableNumber] = useState<string | null>(null);
    const [sendingTreat, setSendingTreat] = useState(false);
    const [treatSuccessModal, setTreatSuccessModal] = useState(false);

    const {
        addItem,
        getTotalItems,
        getTotalAmount,
        sessionToken,
        setSession,
        ensureTable,
    } = useCartStore();

    // Fetch menu data
    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            const response = await publicApi.get(`/public/menu/${tableQR}`);
            const { restaurant, table, categories, featuredItems } = response.data;

            setRestaurant(restaurant);
            setTable(table);
            setCategories(categories);
            setFeaturedItems(featuredItems);

            if (categories.length > 0) {
                setActiveCategory(categories[0].id);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Menü yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [tableQR]);

    useEffect(() => {
        if (tableQR) {
            // Farklı masa QR'ı ile girilmişse sepeti temizle
            ensureTable(tableQR);
            fetchMenu();
        }
    }, [tableQR, fetchMenu, ensureTable]);

    // Not: QR ile menüye ilk girişte direkt menü görünsün.
    // Lokasyon/onay modalını sadece siparişe başlarken göstereceğiz.

    // Start session with location
    const startSession = async () => {
        if (!restaurant || !table) return;

        setSessionStarting(true);
        setLocationError(null);

        try {
            // Get user location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            // Start session via API
            const response = await publicApi.post('/sessions/start', {
                qrCode: tableQR,
                latitude,
                longitude,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    language: navigator.language
                }
            });

            const { session, locationVerified } = response.data;

            if (locationVerified) {
                setSession(
                    session.token,
                    table.tableNumber,
                    restaurant.name,
                    new Date(session.expiresAt),
                    tableQR
                );
                setShowLocationModal(false);
            }
        } catch (err: any) {
            // DEV MODE BYPASS: If localhost, force succeed for testing if location fails
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn("Dev mode: Bypassing location check");
                // We can't really bypass easily without backend support or mocking session. 
                // But usually dev envs don't enforce location strictness if configured so. 
                // For now, let's show error.
            }

            if (err.code === 1) { // PERMISSION_DENIED
                setLocationError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
            } else if (err.code === 2) { // POSITION_UNAVAILABLE
                setLocationError('Konum alınamadı. Lütfen tekrar deneyin.');
            } else if (err.response?.data?.error) {
                setLocationError(err.response.data.error);
            } else {
                setLocationError('Oturum başlatılamadı. Lütfen tekrar deneyin.');
            }
        } finally {
            setSessionStarting(false);
        }
    };

    // Manual session start without location (manuel masa girişi alternatifi)
    const startSessionWithoutLocation = async () => {
        if (!restaurant || !table) return;

        setSessionStarting(true);
        setLocationError(null);

        try {
            const response = await publicApi.post('/sessions/start', {
                qrCode: tableQR,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    language: navigator.language
                }
            });

            const { session } = response.data;

            setSession(
                session.token,
                table.tableNumber,
                restaurant.name,
                new Date(session.expiresAt),
                tableQR
            );
            setShowLocationModal(false);
        } catch (err: any) {
            setLocationError(err.response?.data?.error || 'Oturum başlatılamadı. Lütfen tekrar deneyin.');
        } finally {
            setSessionStarting(false);
        }
    };

    // Add to cart OR Send Treat
    const handleAddToCart = async (item: MenuItem, quantity: number = 1, notes?: string) => {
        // Oturum yoksa önce lokasyon/onay modalını aç
        if (!sessionToken) {
            setShowLocationModal(true);
            return;
        }

        if (isTreatMode) {
            if (!targetTableId) {
                alert("Lütfen önce ikram edilecek masayı seçin.");
                setShowTableSelection(true);
                return;
            }

            // Confirm Treat
            if (!confirm(`Masa ${targetTableNumber}'a ${item.name} ikram etmek istiyor musunuz?`)) {
                return;
            }

            setSendingTreat(true);
            try {
                // Call API to create treat
                await publicApi.post('/treats', {
                    fromTableId: table?.id,
                    toTableId: targetTableId,
                    menuItemId: item.id,
                    note: notes // Optional note logic can be added later
                });

                setSelectedItem(null);
                setTreatSuccessModal(true);
                setIsTreatMode(false); // Helper function to exit treat mode
                setTargetTableId(null);
                setTargetTableNumber(null);
            } catch (error) {
                console.error("Treat error:", error);
                alert("İkram gönderilemedi. Lütfen tekrar deneyin.");
            } finally {
                setSendingTreat(false);
            }
            return;
        }

        // Normal Cart Logic
        addItem({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            notes
        });

        // Add multiple times for quantity > 1
        for (let i = 1; i < quantity; i++) {
            addItem({
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                notes
            });
        }

        setSelectedItem(null);
        setItemQuantity(1);
        setItemNote('');
    };

    const handleTableSelect = (table: any) => {
        setTargetTableId(table.id);
        setTargetTableNumber(table.tableNumber);
        setIsTreatMode(true);
        setShowTableSelection(false);
    };

    // Render loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Menü yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Render error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardBody className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const totalItems = getTotalItems();
    const totalAmount = getTotalAmount();

    return (
        <ThemeProvider themeSettings={restaurant?.themeSettings}>
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Header */}
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
                                    onClick={toggleLang}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    {lang === 'tr' ? 'EN' : 'TR'}
                                </button>
                                {sessionToken && (
                                    <SessionTimer onExpire={() => router.push('/')} />
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
                                onClick={() => {
                                    setIsTreatMode(false);
                                    setTargetTableId(null);
                                }}
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
                                onClick={() => {
                                    if (isTreatMode) {
                                        setIsTreatMode(false);
                                        setTargetTableId(null);
                                    } else {
                                        setShowTableSelection(true);
                                    }
                                }}
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
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
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

                {/* Search Bar */}
                <div className="px-4 pt-3 pb-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={lang === 'tr' ? 'Menüde ara...' : 'Search menu...'}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
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
                        <h2 className="text-lg font-bold text-gray-900 mb-3">{lang === 'tr' ? '⭐ Öne Çıkanlar' : '⭐ Featured'}</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {featuredItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="h-24 bg-gray-100 relative">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="160px" />
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
                        categories
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
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{t(category.name, category.nameEn)}</h3>
                                    <div className="space-y-3">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item) => (
                                                <Card
                                                    key={item.id}
                                                    hoverable
                                                    className={`overflow-hidden transition-all ${isTreatMode ? 'ring-2 ring-purple-400 bg-purple-50/50' : ''}`}
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    <CardBody className="p-0">
                                                        <div className="flex">
                                                            <div className="flex-1 p-3">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-gray-900">{t(item.name, item.nameEn)}</h4>
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
                                                                        {/* Allergens & Dietary */}
                                                                        {(item.allergens.length > 0 || item.dietaryInfo.length > 0) && (
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
                                                            {/* Image or Add Button */}
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
                                                                        handleAddToCart(item);
                                                                    }}
                                                                    className={`absolute bottom-2 right-2 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg transition-colors ${isTreatMode
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
                                                <p className="text-sm">{lang === 'tr' ? 'Bu kategoride ürün bulunamadı' : 'No items in this category'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            }).filter(Boolean)
                    ) : (
                        <div className="text-center py-12">
                            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">{lang === 'tr' ? 'Menü bulunamadı' : 'Menu not found'}</p>
                            <p className="text-sm text-gray-500 mt-2">{lang === 'tr' ? 'Lütfen geçerli bir QR kod kullanın' : 'Please use a valid QR code'}</p>
                        </div>
                    )}

                    {/* Search - no results */}
                    {searchQuery && categories.length > 0 && categories
                        .filter((cat) => activeCategory === null || cat.id === activeCategory)
                        .every((cat) => cat.menuItems.every((item) => {
                            const q = searchQuery.toLowerCase();
                            return !(
                                item.name.toLowerCase().includes(q) ||
                                (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
                                (item.description && item.description.toLowerCase().includes(q)) ||
                                (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q))
                            );
                        })) && (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">
                                {lang === 'tr' ? `"${searchQuery}" için sonuç bulunamadı` : `No results for "${searchQuery}"`}
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-3 text-orange-500 text-sm font-medium hover:underline"
                            >
                                {lang === 'tr' ? 'Aramayı Temizle' : 'Clear Search'}
                            </button>
                        </div>
                    )}
                </section>

                {/* Fixed Bottom Cart Bar (Hide in Treat Mode) */}
                {!isTreatMode && totalItems > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                        <button
                            onClick={() => router.push('/cart')}
                            className="w-full bg-orange-500 text-white py-4 rounded-xl flex items-center justify-between px-6 hover:bg-orange-600 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6" />
                                    <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                </div>
                                <span className="font-medium">{lang === 'tr' ? 'Sepeti Görüntüle' : 'View Cart'}</span>
                            </div>
                            <span className="font-bold text-lg">₺{totalAmount.toFixed(2)}</span>
                        </button>
                    </div>
                )}

                {/* Item Detail Modal */}
                <Modal
                    isOpen={!!selectedItem}
                    onClose={() => {
                        setSelectedItem(null);
                        setItemQuantity(1);
                        setItemNote('');
                    }}
                    title={selectedItem ? t(selectedItem.name, selectedItem.nameEn) : ''}
                    size="lg"
                >
                    {selectedItem && (
                        <div>
                            {/* Image */}
                            <div className="h-48 bg-gray-100 -mx-6 -mt-4 mb-4 relative">
                                {selectedItem.imageUrl ? (
                                    <Image
                                        src={selectedItem.imageUrl}
                                        alt={selectedItem.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 500px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <p className="text-2xl font-bold text-orange-600">₺{selectedItem.price}</p>

                                {(selectedItem.description || selectedItem.descriptionEn) && (
                                    <p className="text-gray-600">{t(selectedItem.description || '', selectedItem.descriptionEn)}</p>
                                )}

                                {/* Allergens */}
                                {selectedItem.allergens.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">{lang === 'tr' ? 'Alerjenler:' : 'Allergens:'}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedItem.allergens.map((a) => (
                                                <span key={a} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        {lang === 'tr' ? 'Özel Not (opsiyonel)' : 'Special Note (optional)'}
                                    </label>
                                    <textarea
                                        value={itemNote}
                                        onChange={(e) => setItemNote(e.target.value)}
                                        placeholder={lang === 'tr' ? 'Örn: Baharatsız olsun...' : 'E.g.: No spice please...'}
                                        className="w-full border rounded-lg p-3 text-sm resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Quantity (Hide in Treat Mode, simplify to 1) */}
                                {!isTreatMode && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{lang === 'tr' ? 'Adet:' : 'Qty:'}</span>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                                                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="text-xl font-bold w-8 text-center">{itemQuantity}</span>
                                            <button
                                                onClick={() => setItemQuantity(itemQuantity + 1)}
                                                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Add Button */}
                                <Button
                                    className={`w-full ${isTreatMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                    size="lg"
                                    onClick={() => handleAddToCart(selectedItem, itemQuantity, itemNote)}
                                    isLoading={sendingTreat}
                                >
                                    {isTreatMode ? (
                                        <>
                                            <Gift className="w-5 h-5 mr-2" />
                                            {lang === 'tr' ? 'İkram Et' : 'Send Treat'} - ₺{selectedItem.price}
                                        </>
                                    ) : (
                                        `${lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'} - ₺${(selectedItem.price * itemQuantity).toFixed(2)}`
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Location Permission Modal */}
                <Modal
                    isOpen={showLocationModal}
                    onClose={() => { }}
                    title="Konum İzni Gerekli"
                    showCloseButton={false}
                >
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-orange-500" />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Sipariş verebilmek için restoranda olduğunuzu doğrulamamız gerekiyor.
                            Lütfen konum izni verin.
                        </p>

                        {locationError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                                {locationError}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={startSession}
                                isLoading={sessionStarting}
                            >
                                <MapPin className="w-5 h-5 mr-2" />
                                Konumumu Doğrula
                            </Button>

                            {/* Manuel masa girişi / konum vermeden devam alternatifi */}
                            <button
                                type="button"
                                onClick={startSessionWithoutLocation}
                                disabled={sessionStarting}
                                className="w-full text-sm text-gray-500 underline disabled:opacity-50"
                            >
                                Konum vermeden devam et (garson onayı ile)
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Table Selection Modal */}
                <TableSelectionModal
                    isOpen={showTableSelection}
                    onClose={() => setShowTableSelection(false)}
                    onSelect={handleTableSelect}
                    currentTableId={table?.id}
                    restaurantId={restaurant?.id}
                />

                {/* Success Modal */}
                <Modal
                    isOpen={treatSuccessModal}
                    onClose={() => setTreatSuccessModal(false)}
                    title="İkram Gönderildi! 🎁"
                    size="sm"
                >
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-8 h-8" />
                        </div>
                        <p className="text-gray-700 font-medium mb-4">
                            Harika! İkramınız diğer masaya iletiliyor.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Ödeme adımında bu ikram hesabınıza yansıtılacaktır.
                        </p>
                        <Button onClick={() => setTreatSuccessModal(false)} className="w-full bg-green-600 hover:bg-green-700">
                            Tamam
                        </Button>
                    </div>
                </Modal>
            </div>
        </ThemeProvider>
    );
}

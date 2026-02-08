'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button, Card, CardBody, Badge, Modal } from '@/components/ui';
import SessionTimer from '@/components/SessionTimer';
import { ShoppingCart, Plus, Minus, Clock, MapPin, X, AlertTriangle, ChevronRight } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    nameEn?: string;
    description?: string;
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

    const {
        addItem,
        getTotalItems,
        getTotalAmount,
        sessionToken,
        setSession,
        tableNumber: storedTableNumber
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
            fetchMenu();
        }
    }, [tableQR, fetchMenu]);

    // Check if session exists or start new one
    useEffect(() => {
        if (restaurant && !sessionToken) {
            setShowLocationModal(true);
        }
    }, [restaurant, sessionToken]);

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
                    new Date(session.expiresAt)
                );
                setShowLocationModal(false);
            }
        } catch (err: any) {
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

    // Add to cart
    const handleAddToCart = (item: MenuItem, quantity: number = 1, notes?: string) => {
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {restaurant?.logoUrl ? (
                                <img
                                    src={restaurant.logoUrl}
                                    alt={restaurant.name}
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
                                <p className="text-sm text-gray-500">Masa {table?.tableNumber}</p>
                            </div>
                        </div>
                        {sessionToken && (
                            <SessionTimer onExpire={() => router.push('/')} />
                        )}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="overflow-x-auto scrollbar-hide border-t">
                    <div className="flex px-4 py-2 gap-2">
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
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Featured Items */}
            {featuredItems.length > 0 && (
                <section className="px-4 py-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">⭐ Öne Çıkanlar</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {featuredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="h-24 bg-gray-100">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                    <p className="text-orange-600 font-bold">₺{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Menu Items by Category */}
            <section className="px-4 pb-4">
                {categories
                    .filter((cat) => activeCategory === null || cat.id === activeCategory)
                    .map((category) => (
                        <div key={category.id} className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{category.name}</h3>
                            <div className="space-y-3">
                                {category.menuItems.map((item) => (
                                    <Card
                                        key={item.id}
                                        hoverable
                                        className="overflow-hidden"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <CardBody className="p-0">
                                            <div className="flex">
                                                <div className="flex-1 p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-orange-600 font-bold">₺{item.price}</span>
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
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
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
                                                        className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
            </section>

            {/* Fixed Bottom Cart Bar */}
            {totalItems > 0 && (
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
                            <span className="font-medium">Sepeti Görüntüle</span>
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
                title={selectedItem?.name || ''}
                size="lg"
            >
                {selectedItem && (
                    <div>
                        {/* Image */}
                        <div className="h-48 bg-gray-100 -mx-6 -mt-4 mb-4">
                            {selectedItem.imageUrl ? (
                                <img
                                    src={selectedItem.imageUrl}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <p className="text-2xl font-bold text-orange-600">₺{selectedItem.price}</p>

                            {selectedItem.description && (
                                <p className="text-gray-600">{selectedItem.description}</p>
                            )}

                            {/* Allergens */}
                            {selectedItem.allergens.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Alerjenler:</p>
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
                                    Özel Not (opsiyonel)
                                </label>
                                <textarea
                                    value={itemNote}
                                    onChange={(e) => setItemNote(e.target.value)}
                                    placeholder="Örn: Baharatsız olsun..."
                                    className="w-full border rounded-lg p-3 text-sm resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Adet:</span>
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

                            {/* Add Button */}
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => handleAddToCart(selectedItem, itemQuantity, itemNote)}
                            >
                                Sepete Ekle - ₺{(selectedItem.price * itemQuantity).toFixed(2)}
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

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={startSession}
                        isLoading={sessionStarting}
                    >
                        <MapPin className="w-5 h-5 mr-2" />
                        Konumumu Doğrula
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

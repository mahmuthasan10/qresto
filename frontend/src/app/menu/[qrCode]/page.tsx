'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { useCartStore, useCartHydrated } from '@/stores/cartStore';
import { Button, Card, CardBody, Modal } from '@/components/ui';
import { TableSelectionModal } from '@/components/Treats/TableSelectionModal';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { AlertTriangle, Gift } from 'lucide-react';
import { useMenuData } from '@/components/menu/useMenuData';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { LocationModal } from '@/components/menu/LocationModal';
import { MenuContent } from '@/components/menu/MenuContent';
import { InlineCheckoutSheet } from '@/components/menu/InlineCheckoutSheet';
import type { MenuItem, Lang } from '@/components/menu/types';

export default function MenuPage() {
    const params = useParams();
    const router = useRouter();
    const tableQR = params.qrCode as string;
    const prevQrRef = useRef<string | null>(null);

    // ─── Menu verisi (useMenuData custom hook) ───────────────────────────────
    const { restaurant, table, categories, featuredItems, loading, error, fetchMenu } =
        useMenuData(tableQR);

    // ─── UI State ────────────────────────────────────────────────────────────
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemNote, setItemNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // ─── Dil ─────────────────────────────────────────────────────────────────
    const [lang, setLang] = useState<Lang>('tr');

    useEffect(() => {
        const saved = localStorage.getItem('qresto-lang');
        if (saved === 'en') setLang('en');
    }, []);

    const toggleLang = () => {
        const next = lang === 'tr' ? 'en' : 'tr';
        setLang(next);
        localStorage.setItem('qresto-lang', next);
    };

    const t = (tr: string, en?: string | null) => (lang === 'en' && en ? en : tr);

    // ─── Treat State ─────────────────────────────────────────────────────────
    const [isTreatMode, setIsTreatMode] = useState(false);
    const [showTableSelection, setShowTableSelection] = useState(false);
    const [targetTableId, setTargetTableId] = useState<number | null>(null);
    const [targetTableNumber, setTargetTableNumber] = useState<string | null>(null);
    const [sendingTreat, setSendingTreat] = useState(false);
    const [treatSuccessModal, setTreatSuccessModal] = useState(false);

    // ─── Inline Checkout ─────────────────────────────────────────────────────
    const [showCheckoutSheet, setShowCheckoutSheet] = useState(false);

    // ─── Session State ───────────────────────────────────────────────────────
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [sessionStarting, setSessionStarting] = useState(false);

    // Granular selector'lar — tüm store'a subscribe olmak yerine sadece ilgili
    // slice'lara subscribe olarak gereksiz re-render'ları önlüyoruz.
    const addItem      = useCartStore((s) => s.addItem);
    const setSession   = useCartStore((s) => s.setSession);
    const ensureTable  = useCartStore((s) => s.ensureTable);
    const sessionToken = useCartStore((s) => s.sessionToken);
    const getTotalItems   = useCartStore((s) => s.getTotalItems);
    const getTotalAmount  = useCartStore((s) => s.getTotalAmount);
    const hydrated = useCartHydrated();

    // ─── QR değişiminde sepet/kategori sıfırlama ────────────────────────────
    useEffect(() => {
        if (!hydrated || !tableQR) return;
        ensureTable(tableQR);
    }, [tableQR, hydrated, ensureTable]);

    useEffect(() => {
        if (!tableQR) return;
        if (prevQrRef.current !== null && prevQrRef.current !== tableQR) {
            setSearchQuery('');
            setSelectedItem(null);
            setActiveCategory(null);
            setIsTreatMode(false);
            setTargetTableId(null);
            setTargetTableNumber(null);
        }
        prevQrRef.current = tableQR;
        fetchMenu();
    }, [tableQR, fetchMenu]);

    // İlk kategoriye odaklan
    useEffect(() => {
        if (categories.length > 0 && activeCategory === null) {
            setActiveCategory(categories[0].id);
        }
    }, [categories, activeCategory]);

    // ─── Session başlatma ────────────────────────────────────────────────────
    const startSession = async () => {
        if (!restaurant || !table) return;
        setSessionStarting(true);
        setLocationError(null);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                });
            });
            const { latitude, longitude, accuracy } = position.coords;
            const response = await publicApi.post('/sessions/start', {
                qrCode: tableQR,
                latitude,
                longitude,
                accuracy: accuracy ?? undefined,
                deviceInfo: { userAgent: navigator.userAgent, language: navigator.language },
            });
            const { session } = response.data;
            setSession(session.token, table.tableNumber, restaurant.name, new Date(session.expiresAt), tableQR);
            setShowLocationModal(false);
        } catch (err: unknown) {
            const geoErr = err as GeolocationPositionError;
            const axiosErr = err as { response?: { data?: { error?: string } } };
            if (geoErr.code === 1) setLocationError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
            else if (geoErr.code === 2) setLocationError('Konum alınamadı. Lütfen tekrar deneyin.');
            else if (axiosErr.response?.data?.error) setLocationError(axiosErr.response.data.error);
            else setLocationError('Oturum başlatılamadı. Lütfen tekrar deneyin.');
        } finally {
            setSessionStarting(false);
        }
    };

    const startSessionWithoutLocation = async () => {
        if (!restaurant || !table) return;
        setSessionStarting(true);
        setLocationError(null);
        try {
            const response = await publicApi.post('/sessions/start', {
                qrCode: tableQR,
                deviceInfo: { userAgent: navigator.userAgent, language: navigator.language },
            });
            const { session } = response.data;
            setSession(session.token, table.tableNumber, restaurant.name, new Date(session.expiresAt), tableQR);
            setShowLocationModal(false);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setLocationError(axiosErr.response?.data?.error || 'Oturum başlatılamadı.');
        } finally {
            setSessionStarting(false);
        }
    };

    // ─── Sepete ekleme / Treat ────────────────────────────────────────────────
    const handleAddToCart = useCallback(async (item: MenuItem, quantity = 1, notes?: string) => {
        if (!sessionToken) {
            setShowLocationModal(true);
            return;
        }

        if (isTreatMode) {
            if (!targetTableId) {
                setShowTableSelection(true);
                return;
            }
            if (!confirm(`Masa ${targetTableNumber}'a ${item.name} ikram etmek istiyor musunuz?`)) return;

            setSendingTreat(true);
            try {
                await publicApi.post('/treats', {
                    fromTableId: table?.id,
                    toTableId: targetTableId,
                    menuItemId: item.id,
                    note: notes,
                });
                setSelectedItem(null);
                setTreatSuccessModal(true);
                setIsTreatMode(false);
                setTargetTableId(null);
                setTargetTableNumber(null);
            } catch {
                alert('İkram gönderilemedi. Lütfen tekrar deneyin.');
            } finally {
                setSendingTreat(false);
            }
            return;
        }

        // Normal sepet: quantity kadar ekle
        for (let i = 0; i < quantity; i++) {
            addItem({ menuItemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, notes });
        }
        setSelectedItem(null);
        setItemQuantity(1);
        setItemNote('');
    }, [sessionToken, isTreatMode, targetTableId, targetTableNumber, table, addItem]);

    const handleItemModalClose = useCallback(() => {
        setSelectedItem(null);
        setItemQuantity(1);
        setItemNote('');
    }, []);

    const handleTreatModeToggle = useCallback(() => {
        setIsTreatMode(false);
        setTargetTableId(null);
        setTargetTableNumber(null);
    }, []);

    const handleTableSelect = useCallback((selectedTable: { id: number; tableNumber: string }) => {
        setTargetTableId(selectedTable.id);
        setTargetTableNumber(selectedTable.tableNumber);
        setIsTreatMode(true);
        setShowTableSelection(false);
    }, []);

    // ─── Loading / Error states ───────────────────────────────────────────────
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

    return (
        <ThemeProvider themeSettings={restaurant?.themeSettings}>
            <div className="min-h-screen bg-gray-50 pb-24">

                <MenuHeader
                    restaurant={restaurant}
                    table={table}
                    lang={lang}
                    isTreatMode={isTreatMode}
                    activeCategory={activeCategory}
                    categories={categories}
                    hydrated={hydrated}
                    sessionToken={sessionToken}
                    t={t}
                    onLangToggle={toggleLang}
                    onCategorySelect={setActiveCategory}
                    onTreatModeToggle={handleTreatModeToggle}
                    onTableSelectionOpen={() => setShowTableSelection(true)}
                    onSessionExpire={() => router.push('/')}
                />

                <MenuContent
                    categories={categories}
                    featuredItems={featuredItems}
                    searchQuery={searchQuery}
                    activeCategory={activeCategory}
                    isTreatMode={isTreatMode}
                    lang={lang}
                    t={t}
                    hydrated={hydrated}
                    sessionToken={sessionToken}
                    totalItems={getTotalItems()}
                    totalAmount={getTotalAmount()}
                    onItemSelect={setSelectedItem}
                    onQuickAdd={(item) => handleAddToCart(item)}
                    onSearchChange={setSearchQuery}
                    onCartClick={() => setShowCheckoutSheet(true)}
                />

                <MenuItemModal
                    item={selectedItem}
                    isTreatMode={isTreatMode}
                    lang={lang}
                    t={t}
                    quantity={itemQuantity}
                    note={itemNote}
                    sendingTreat={sendingTreat}
                    onClose={handleItemModalClose}
                    onQuantityChange={setItemQuantity}
                    onNoteChange={setItemNote}
                    onConfirm={handleAddToCart}
                />

                <LocationModal
                    isOpen={showLocationModal}
                    sessionStarting={sessionStarting}
                    locationError={locationError}
                    onStartSession={startSession}
                    onStartWithoutLocation={startSessionWithoutLocation}
                />

                <TableSelectionModal
                    isOpen={showTableSelection}
                    onClose={() => setShowTableSelection(false)}
                    onSelect={handleTableSelect}
                    currentTableId={table?.id}
                    restaurantId={restaurant?.id}
                />

                <InlineCheckoutSheet
                    isOpen={showCheckoutSheet}
                    lang={lang}
                    onClose={() => setShowCheckoutSheet(false)}
                />

                {/* Treat başarı modalı */}
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

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { publicApi } from '@/lib/api';
import type { Lang } from './types';

interface InlineCheckoutSheetProps {
    isOpen: boolean;
    lang: Lang;
    onClose: () => void;
}

export function InlineCheckoutSheet({ isOpen, lang, onClose }: InlineCheckoutSheetProps) {
    const router = useRouter();
    const {
        items,
        sessionToken,
        tableNumber,
        restaurantName,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalAmount,
    } = useCartStore();

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_at_table'>('cash');
    const [orderNote, setOrderNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = getTotalAmount();
    const tr = (trText: string, enText: string) => lang === 'en' ? enText : trText;

    const handleSubmit = useCallback(async () => {
        if (!sessionToken || items.length === 0) return;

        setSubmitting(true);
        setError(null);

        try {
            let latitude: number | undefined;
            let longitude: number | undefined;
            let accuracy: number | undefined;

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                accuracy = position.coords.accuracy;
            } catch {
                // Konum alınamazsa devam et
            }

            const response = await publicApi.post('/public/orders', {
                sessionToken,
                items: items.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    notes: item.notes || '',
                })),
                paymentMethod,
                customerNotes: orderNote,
                latitude,
                longitude,
                accuracy,
            });

            const { order } = response.data;
            clearCart();
            onClose();
            router.push(`/order/${order.orderNumber}`);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || tr('Sipariş gönderilemedi.', 'Order failed. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    }, [sessionToken, items, paymentMethod, orderNote, clearCart, onClose, router, lang]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {tr('Siparişini Tamamla', 'Complete Your Order')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {restaurantName} • {tr('Masa', 'Table')} {tableNumber}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {/* Cart items */}
                    {items.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">{tr('Sepetiniz boş', 'Your cart is empty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.menuItemId} className="flex items-center gap-3">
                                    {/* Thumbnail */}
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                                        )}
                                    </div>

                                    {/* Name & price */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-sm text-orange-600 font-bold">
                                            ₺{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            {item.quantity === 1
                                                ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                : <Minus className="w-3.5 h-3.5" />
                                            }
                                        </button>
                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payment method */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            {tr('Ödeme Yöntemi', 'Payment Method')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                                    paymentMethod === 'cash'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 text-gray-600'
                                }`}
                            >
                                <Banknote className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{tr('Nakit', 'Cash')}</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card_at_table')}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                                    paymentMethod === 'card_at_table'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 text-gray-600'
                                }`}
                            >
                                <CreditCard className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{tr('Kart (Masada)', 'Card')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Order note */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            {tr('Sipariş Notu (opsiyonel)', 'Order Note (optional)')}
                        </label>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder={tr('Genel sipariş notu...', 'General order note...')}
                            className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                            rows={2}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Full cart link */}
                    <button
                        onClick={() => { onClose(); router.push('/cart'); }}
                        className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 py-2"
                    >
                        <span>{tr('Sepeti Detaylı Görüntüle', 'View Full Cart')}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Fixed bottom — total + submit */}
                <div className="px-4 pb-6 pt-3 border-t bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 font-medium">{tr('Toplam', 'Total')}</span>
                        <span className="text-xl font-bold text-orange-600">₺{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || items.length === 0}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            tr('Siparişi Ver', 'Place Order')
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

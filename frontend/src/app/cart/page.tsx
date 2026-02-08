'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { publicApi } from '@/lib/api';
import { Button, Card, CardBody, Input, Modal } from '@/components/ui';
import { Minus, Plus, Trash2, ChevronLeft, ShoppingBag, CreditCard, Banknote, AlertTriangle } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const {
        items,
        sessionToken,
        tableNumber,
        restaurantName,
        updateQuantity,
        updateNotes,
        removeItem,
        clearCart,
        getTotalAmount,
    } = useCartStore();

    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_at_table'>('cash');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNoSessionModal, setShowNoSessionModal] = useState(!sessionToken);

    const totalAmount = getTotalAmount();

    const handleSubmitOrder = async () => {
        if (!sessionToken) {
            setShowNoSessionModal(true);
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Get current location
            let latitude: number | undefined;
            let longitude: number | undefined;

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch {
                // Continue without location
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
            });

            const { order } = response.data;
            clearCart();
            router.push(`/order/${order.orderNumber}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Sipariş gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    // Empty cart
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">Sepetim</h1>
                </header>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
                        <p className="text-gray-500 mb-6">Menüden lezzetli ürünler ekleyin!</p>
                        <Button onClick={() => router.back()}>Menüye Dön</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Sepetim</h1>
                            <p className="text-sm text-gray-500">
                                {restaurantName} • Masa {tableNumber}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
                                clearCart();
                            }
                        }}
                        className="text-red-500 text-sm"
                    >
                        Temizle
                    </button>
                </div>
            </header>

            {/* Cart Items */}
            <section className="p-4 space-y-3">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <CardBody className="p-4">
                            <div className="flex gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-medium text-gray-900 truncate pr-2">{item.name}</h3>
                                        <button
                                            onClick={() => removeItem(item.menuItemId)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-lg font-bold text-orange-600 mt-1">
                                        ₺{(item.price * item.quantity).toFixed(2)}
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-gray-400">× ₺{item.price}</span>
                                    </div>

                                    {/* Notes */}
                                    {item.notes && (
                                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                                            📝 {item.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </section>

            {/* Order Note */}
            <section className="px-4 mb-4">
                <Card>
                    <CardBody>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Sipariş Notu (opsiyonel)
                        </label>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Genel sipariş notunuz..."
                            className="w-full border rounded-lg p-3 text-sm resize-none"
                            rows={2}
                        />
                    </CardBody>
                </Card>
            </section>

            {/* Payment Method */}
            <section className="px-4 mb-4">
                <Card>
                    <CardBody>
                        <label className="text-sm font-medium text-gray-700 block mb-3">
                            Ödeme Yöntemi
                        </label>
                        <div className="space-y-2">
                            <label
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : ''
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'cash'}
                                    onChange={() => setPaymentMethod('cash')}
                                    className="text-orange-500"
                                />
                                <Banknote className="w-5 h-5 text-gray-600" />
                                <span>Nakit</span>
                            </label>
                            <label
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'card_at_table' ? 'border-orange-500 bg-orange-50' : ''
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'card_at_table'}
                                    onChange={() => setPaymentMethod('card_at_table')}
                                    className="text-orange-500"
                                />
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <span>Kredi Kartı (Masada)</span>
                            </label>
                        </div>
                    </CardBody>
                </Card>
            </section>

            {/* Error */}
            {error && (
                <div className="px-4 mb-4">
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Toplam</span>
                    <span className="text-2xl font-bold text-gray-900">₺{totalAmount.toFixed(2)}</span>
                </div>
                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitOrder}
                    isLoading={submitting}
                >
                    Siparişi Gönder
                </Button>
            </div>

            {/* No Session Modal */}
            <Modal
                isOpen={showNoSessionModal}
                onClose={() => setShowNoSessionModal(false)}
                title="Oturum Bulunamadı"
            >
                <div className="text-center py-4">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">
                        Sipariş vermek için QR kodu okutarak menüye erişmeniz gerekiyor.
                    </p>
                    <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
                </div>
            </Modal>
        </div>
    );
}

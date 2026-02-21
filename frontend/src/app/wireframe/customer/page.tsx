'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Badge, Modal, Tabs, Textarea } from '@/components/ui';
import {
    MapPin, Clock, Plus, Minus, ShoppingCart, ArrowLeft,
    ChefHat, CheckCircle
} from 'lucide-react';

// Mock data
const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'starters', label: '🥗 Başlangıçlar' },
    { id: 'mains', label: '🍕 Ana Yemekler' },
    { id: 'drinks', label: '🥤 İçecekler' },
    { id: 'desserts', label: '🍰 Tatlılar' },
];

const menuItems = [
    { id: 1, name: 'Margherita Pizza', price: 120, category: 'mains', image: '🍕', desc: 'Domates, mozzarella, fesleğen' },
    { id: 2, name: 'Caesar Salad', price: 85, category: 'starters', image: '🥗', desc: 'Marul, parmesan, kruton' },
    { id: 3, name: 'Kola', price: 25, category: 'drinks', image: '🥤', desc: '330ml' },
    { id: 4, name: 'Tiramisu', price: 65, category: 'desserts', image: '🍰', desc: 'İtalyan tatlısı' },
    { id: 5, name: 'Spaghetti Bolognese', price: 95, category: 'mains', image: '🍝', desc: 'Kıymalı makarna' },
    { id: 6, name: 'Limonata', price: 30, category: 'drinks', image: '🍋', desc: 'Taze sıkılmış' },
];

type CartItem = { id: number; name: string; price: number; quantity: number; note?: string };
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';

export default function CustomerWireframe() {
    const [view, setView] = useState<'location' | 'menu' | 'cart' | 'tracking'>('location');
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<typeof menuItems[0] | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
    const [sessionTime] = useState(1800); // 30 minutes

    const addToCart = (item: typeof menuItems[0]) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) {
                return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
    };

    const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
    const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

    const filteredItems = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.category === activeCategory);

    // Location Permission Screen
    if (view === 'location') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Konumunuzu Doğrulayın</h1>
                    <p className="text-gray-600 mb-6">
                        Sipariş verebilmek için restoran içinde olduğunuzu doğrulamamız gerekiyor.
                    </p>
                    <Button className="w-full" size="lg" onClick={() => setView('menu')}>
                        <MapPin className="w-5 h-5 mr-2" />
                        Konumu Doğrula
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">
                        Masa: 5 • Bella Italia Restaurant
                    </p>
                </div>
            </div>
        );
    }

    // Order Tracking Screen
    if (view === 'tracking') {
        const steps = [
            { status: 'pending', label: 'Sipariş Alındı', icon: CheckCircle },
            { status: 'confirmed', label: 'Onaylandı', icon: CheckCircle },
            { status: 'preparing', label: 'Hazırlanıyor', icon: ChefHat },
            { status: 'ready', label: 'Hazır', icon: CheckCircle },
        ];

        const currentIndex = steps.findIndex(s => s.status === orderStatus);

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm px-4 py-4">
                    <h1 className="text-xl font-bold text-center">Sipariş Takibi</h1>
                    <p className="text-center text-gray-500 text-sm">ORD-20260208-001</p>
                </div>

                {/* Status Stepper */}
                <div className="p-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="relative">
                            {steps.map((step, idx) => (
                                <div key={step.status} className="flex items-center mb-6 last:mb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx <= currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4">
                                        <p className={`font-medium ${idx <= currentIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                        {idx === currentIndex && (
                                            <p className="text-sm text-green-600">Şu anda burada</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details */}
                    <Card className="mt-6">
                        <CardBody>
                            <h3 className="font-semibold mb-3">Sipariş Detayı</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>2x Margherita Pizza</span>
                                    <span>₺240</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>1x Kola</span>
                                    <span>₺25</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between font-bold">
                                    <span>Toplam</span>
                                    <span>₺265</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Demo buttons */}
                    <div className="mt-6 flex gap-2 flex-wrap">
                        {steps.map(s => (
                            <Button key={s.status} size="sm" variant={orderStatus === s.status ? 'primary' : 'outline'} onClick={() => setOrderStatus(s.status as OrderStatus)}>
                                {s.label}
                            </Button>
                        ))}
                    </div>

                    <Button className="w-full mt-6" variant="outline" onClick={() => { setView('menu'); setCart([]); }}>
                        Yeni Sipariş Ver
                    </Button>
                </div>
            </div>
        );
    }

    // Cart Screen
    if (view === 'cart') {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Header */}
                <div className="bg-white shadow-sm px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setView('menu')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Sepetim</h1>
                    <Badge variant="count" count={totalItems} />
                </div>

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <ShoppingCart className="w-16 h-16 mb-4" />
                        <p>Sepetiniz boş</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {cart.map(item => (
                            <Card key={item.id}>
                                <CardBody className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-orange-600 font-semibold">₺{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}

                        <Textarea label="Sipariş Notu" placeholder="Özel isteklerinizi yazın..." className="mt-4" />
                    </div>
                )}

                {/* Bottom Bar */}
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600">Toplam</span>
                            <span className="text-2xl font-bold">₺{totalPrice}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setView('tracking')}>
                            Siparişi Gönder
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Menu Screen
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-lg font-bold">🍕 Bella Italia</h1>
                        <p className="text-sm text-gray-500">Masa 5</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
                <Tabs tabs={categories} activeTab={activeCategory} onTabChange={setActiveCategory} variant="pills" />
            </div>

            {/* Menu Items */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {filteredItems.map(item => (
                    <Card key={item.id} hoverable onClick={() => setSelectedItem(item)}>
                        <CardBody className="p-3">
                            <div className="text-4xl mb-2">{item.image}</div>
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-orange-600">₺{item.price}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                    className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Product Detail Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={selectedItem?.name}
            >
                {selectedItem && (
                    <div className="text-center">
                        <div className="text-6xl mb-4">{selectedItem.image}</div>
                        <p className="text-gray-600 mb-4">{selectedItem.desc}</p>
                        <p className="text-2xl font-bold text-orange-600 mb-4">₺{selectedItem.price}</p>
                        <Button className="w-full" onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}>
                            Sepete Ekle
                        </Button>
                    </div>
                )}
            </Modal>

            {/* Bottom Cart Bar */}
            {totalItems > 0 && (
                <div
                    className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setView('cart')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4" />
                        </div>
                        <span>{totalItems} ürün</span>
                    </div>
                    <span className="font-bold text-lg">₺{totalPrice}</span>
                </div>
            )}
        </div>
    );
}

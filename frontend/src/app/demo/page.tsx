'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardBody, CardFooter, Modal, Tabs, Badge } from '@/components/ui';
import { ShoppingCart, Coffee, Pizza, Utensils } from 'lucide-react';

export default function DemoPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'Tümü', icon: <Utensils size={16} /> },
        { id: 'coffee', label: 'İçecekler', icon: <Coffee size={16} /> },
        { id: 'pizza', label: 'Ana Yemekler', icon: <Pizza size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-12">
                <h1 className="text-3xl font-bold text-gray-900 text-center">
                    🎨 QResto Component Library Demo
                </h1>

                {/* Buttons Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="primary" isLoading>Loading</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                {/* Inputs Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Normal Input" placeholder="Bir şeyler yazın..." />
                        <Input label="Error Input" placeholder="Hatalı alan" error="Bu alan zorunludur" />
                        <Textarea label="Textarea" placeholder="Notlarınızı yazın..." />
                        <Textarea label="Error Textarea" error="Minimum 10 karakter gerekli" />
                    </div>
                </section>

                {/* Tabs Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Tabs</h2>
                    <div className="space-y-6 bg-white p-4 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Default</p>
                            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Pills</p>
                            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Underline</p>
                            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />
                        </div>
                    </div>
                </section>

                {/* Badges Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Badges</h2>
                    <div className="flex flex-wrap gap-3">
                        <Badge status="pending" />
                        <Badge status="confirmed" />
                        <Badge status="preparing" />
                        <Badge status="ready" />
                        <Badge status="completed" />
                        <Badge status="cancelled" />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-gray-600">Count Badges:</span>
                        <Badge variant="count" count={3} />
                        <Badge variant="count" count={25} />
                        <Badge variant="count" count={150} />
                    </div>
                </section>

                {/* Cards Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card variant="product" hoverable>
                            <CardBody>
                                <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                                    <Pizza className="w-12 h-12 text-orange-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Margherita Pizza</h3>
                                <p className="text-sm text-gray-500 mt-1">Domates, mozzarella, fesleğen</p>
                                <p className="text-lg font-bold text-orange-600 mt-2">₺120</p>
                            </CardBody>
                            <CardFooter>
                                <Button className="w-full" size="sm">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Sepete Ekle
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card variant="order">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">#ORD-001</span>
                                    <Badge status="preparing" />
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-sm text-gray-600">Masa 5</p>
                                <ul className="mt-2 text-sm space-y-1">
                                    <li>2x Margherita Pizza</li>
                                    <li>1x Cola</li>
                                </ul>
                            </CardBody>
                            <CardFooter>
                                <span className="font-semibold">Toplam: ₺260</span>
                            </CardFooter>
                        </Card>

                        <Card variant="stat">
                            <CardBody className="text-center">
                                <p className="text-4xl font-bold text-orange-600">42</p>
                                <p className="text-gray-600 mt-1">Bugünkü Sipariş</p>
                            </CardBody>
                        </Card>
                    </div>
                </section>

                {/* Modals Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Modals</h2>
                    <div className="flex gap-4">
                        <Button onClick={() => setIsModalOpen(true)}>Form Modal</Button>
                        <Button variant="danger" onClick={() => setIsConfirmModalOpen(true)}>
                            Confirmation Modal
                        </Button>
                    </div>
                </section>

                {/* Form Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Yeni Ürün Ekle"
                    variant="form"
                >
                    <div className="space-y-4">
                        <Input label="Ürün Adı" placeholder="Ör: Margherita Pizza" />
                        <Input label="Fiyat" type="number" placeholder="₺0.00" />
                        <Textarea label="Açıklama" placeholder="Ürün açıklaması..." />
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                                İptal
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Kaydet</Button>
                        </div>
                    </div>
                </Modal>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    title="Siparişi İptal Et"
                    variant="confirmation"
                    confirmText="Evet, İptal Et"
                    cancelText="Hayır"
                    confirmVariant="danger"
                    onConfirm={() => setIsConfirmModalOpen(false)}
                >
                    <p className="text-gray-600">
                        Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </p>
                </Modal>
            </div>
        </div>
    );
}

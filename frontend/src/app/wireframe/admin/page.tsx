'use client';

import { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader, Badge, Tabs, Modal, Textarea } from '@/components/ui';
import {
    LayoutDashboard, UtensilsCrossed, Grid3X3, ClipboardList, Settings, LogOut,
    Plus, Edit2, Trash2, QrCode, Download, Eye, TrendingUp, Users, DollarSign,
    Menu as MenuIcon
} from 'lucide-react';

type AdminView = 'dashboard' | 'menu' | 'tables' | 'orders' | 'settings';

interface SidebarProps {
    sidebarOpen: boolean;
    view: AdminView;
    menuTabs: { id: string; label: string; icon: React.ReactNode }[];
    onViewChange: (view: AdminView) => void;
    onClose: () => void;
}

function Sidebar({ sidebarOpen, view, menuTabs, onViewChange, onClose }: SidebarProps) {
    return (
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold">QResto Admin</h1>
                <p className="text-sm text-gray-400 mt-1">Bella Italia</p>
            </div>
            <nav className="p-4 space-y-1">
                {menuTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { onViewChange(tab.id as AdminView); onClose(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === tab.id ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

// Mock data
const ordersMock = [
    { id: 'ORD-001', table: 5, items: '2x Pizza, 1x Kola', total: 265, status: 'preparing' as const, time: '5 dk önce' },
    { id: 'ORD-002', table: 3, items: '1x Salad', total: 85, status: 'pending' as const, time: '2 dk önce' },
    { id: 'ORD-003', table: 8, items: '3x Pasta', total: 285, status: 'ready' as const, time: '12 dk önce' },
];

const menuItemsMock = [
    { id: 1, name: 'Margherita Pizza', price: 120, category: 'Ana Yemek', active: true },
    { id: 2, name: 'Caesar Salad', price: 85, category: 'Başlangıç', active: true },
    { id: 3, name: 'Tiramisu', price: 65, category: 'Tatlı', active: false },
];

const tablesMock = [
    { id: 1, number: 1, capacity: 2, active: true },
    { id: 2, number: 2, capacity: 4, active: true },
    { id: 3, number: 3, capacity: 4, active: true },
    { id: 4, number: 4, capacity: 6, active: false },
    { id: 5, number: 5, capacity: 2, active: true },
    { id: 6, number: 6, capacity: 8, active: true },
];

export default function AdminWireframe() {
    const [view, setView] = useState<AdminView>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    const menuTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'menu', label: 'Menü', icon: <UtensilsCrossed size={18} /> },
        { id: 'tables', label: 'Masalar', icon: <Grid3X3 size={18} /> },
        { id: 'orders', label: 'Siparişler', icon: <ClipboardList size={18} /> },
        { id: 'settings', label: 'Ayarlar', icon: <Settings size={18} /> },
    ];

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="stat">
                    <CardBody className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">42</p>
                            <p className="text-sm text-gray-500">Bugün Sipariş</p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="stat">
                    <CardBody className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">₺4,280</p>
                            <p className="text-sm text-gray-500">Bugün Gelir</p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="stat">
                    <CardBody className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">8</p>
                            <p className="text-sm text-gray-500">Aktif Masa</p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="stat">
                    <CardBody className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">₺102</p>
                            <p className="text-sm text-gray-500">Ort. Sipariş</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Active Orders */}
            <Card>
                <CardHeader>
                    <h2 className="font-semibold">Aktif Siparişler</h2>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="divide-y">
                        {ordersMock.map(order => (
                            <div key={order.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.id}</span>
                                        <Badge status={order.status} />
                                    </div>
                                    <p className="text-sm text-gray-500">Masa {order.table} • {order.items}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₺{order.total}</p>
                                    <p className="text-xs text-gray-400">{order.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderMenu = () => (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Menü Yönetimi</h2>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Ürün
                </Button>
            </div>

            <div className="flex gap-2">
                <Input placeholder="Ürün ara..." className="max-w-xs" />
            </div>

            <div className="grid gap-3">
                {menuItemsMock.map(item => (
                    <Card key={item.id}>
                        <CardBody className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                    🍕
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        {!item.active && <Badge status="cancelled">Pasif</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-500">{item.category} • ₺{item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm"><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderTables = () => (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Masa Yönetimi</h2>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Masa
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tablesMock.map(table => (
                    <Card key={table.id} className={!table.active ? 'opacity-50' : ''}>
                        <CardBody className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-orange-600">{table.number}</span>
                            </div>
                            <p className="font-medium">Masa {table.number}</p>
                            <p className="text-sm text-gray-500">{table.capacity} Kişilik</p>
                            <div className="flex justify-center gap-2 mt-3">
                                <Button variant="outline" size="sm" onClick={() => setShowQRModal(true)}>
                                    <QrCode className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Sipariş Listesi</h2>
                <div className="flex gap-2">
                    <Tabs
                        tabs={[
                            { id: 'active', label: 'Aktif' },
                            { id: 'completed', label: 'Tamamlanan' },
                        ]}
                        activeTab="active"
                        onTabChange={() => { }}
                        variant="pills"
                    />
                </div>
            </div>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-sm text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Sipariş No</th>
                                <th className="px-4 py-3">Masa</th>
                                <th className="px-4 py-3">Ürünler</th>
                                <th className="px-4 py-3">Tutar</th>
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3">Zaman</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ordersMock.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{order.id}</td>
                                    <td className="px-4 py-3">Masa {order.table}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{order.items}</td>
                                    <td className="px-4 py-3 font-semibold">₺{order.total}</td>
                                    <td className="px-4 py-3"><Badge status={order.status} /></td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{order.time}</td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-semibold">Ayarlar</h2>

            <Card>
                <CardHeader><h3 className="font-medium">Restoran Bilgileri</h3></CardHeader>
                <CardBody className="space-y-4">
                    <Input label="Restoran Adı" defaultValue="Bella Italia" />
                    <Input label="Telefon" defaultValue="+90 212 123 4567" />
                    <Textarea label="Adres" defaultValue="Kadıköy, İstanbul" />
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h3 className="font-medium">Oturum Ayarları</h3></CardHeader>
                <CardBody className="space-y-4">
                    <Input label="Oturum Süresi (dakika)" type="number" defaultValue="30" />
                    <Input label="Konum Yarıçapı (metre)" type="number" defaultValue="50" />
                </CardBody>
            </Card>

            <Button>Kaydet</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar
                sidebarOpen={sidebarOpen}
                view={view}
                menuTabs={menuTabs}
                onViewChange={setView}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="bg-white shadow-sm px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                    <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold capitalize">{view}</h1>
                    <div className="flex items-center gap-2">
                        <Badge variant="count" count={3} />
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 lg:p-6">
                    {view === 'dashboard' && renderDashboard()}
                    {view === 'menu' && renderMenu()}
                    {view === 'tables' && renderTables()}
                    {view === 'orders' && renderOrders()}
                    {view === 'settings' && renderSettings()}
                </main>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={view === 'menu' ? 'Yeni Ürün Ekle' : 'Yeni Masa Ekle'}
            >
                <div className="space-y-4">
                    {view === 'menu' ? (
                        <>
                            <Input label="Ürün Adı" placeholder="Ör: Margherita Pizza" />
                            <Input label="Fiyat" type="number" placeholder="₺0" />
                            <Input label="Kategori" placeholder="Ana Yemek" />
                            <Textarea label="Açıklama" />
                        </>
                    ) : (
                        <>
                            <Input label="Masa Numarası" type="number" />
                            <Input label="Kapasite" type="number" placeholder="4" />
                        </>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowAddModal(false)}>İptal</Button>
                        <Button onClick={() => setShowAddModal(false)}>Kaydet</Button>
                    </div>
                </div>
            </Modal>

            {/* QR Modal */}
            <Modal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                title="Masa QR Kodu"
            >
                <div className="text-center">
                    <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">Masa 1 - Bella Italia</p>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            PNG
                        </Button>
                        <Button>
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

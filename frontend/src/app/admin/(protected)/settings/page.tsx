'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Card, CardBody, CardHeader, Tabs, Textarea } from '@/components/ui';
import {
    Building,
    MapPin,
    Clock,
    Shield,
    Save,
    Eye,
    EyeOff,
    Palette,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type SettingsTab = 'general' | 'location' | 'session' | 'theme' | 'security';

interface GeneralFormData {
    name: string;
    phone: string;
    address: string;
}

interface LocationFormData {
    latitude: number;
    longitude: number;
    locationRadius: number;
}

interface SessionFormData {
    sessionTimeout: number;
}

interface ThemeFormData {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function SettingsPage() {
    const { restaurant, updateRestaurant } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Form states
    const [generalForm, setGeneralForm] = useState<GeneralFormData>({
        name: '',
        phone: '',
        address: '',
    });

    const [locationForm, setLocationForm] = useState<LocationFormData>({
        latitude: 0,
        longitude: 0,
        locationRadius: 50,
    });

    const [sessionForm, setSessionForm] = useState<SessionFormData>({
        sessionTimeout: 30,
    });

    const [themeForm, setThemeForm] = useState<ThemeFormData>({
        primaryColor: '#f97316',
        secondaryColor: '#ef4444',
        fontFamily: 'Inter',
        borderRadius: '0.75rem',
    });

    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (restaurant) {
            setGeneralForm({
                name: restaurant.name || '',
                phone: restaurant.phone || '',
                address: restaurant.address || '',
            });
            setLocationForm({
                latitude: restaurant.latitude || 0,
                longitude: restaurant.longitude || 0,
                locationRadius: restaurant.locationRadius || 50,
            });
            setSessionForm({
                sessionTimeout: restaurant.sessionTimeout || 30,
            });
            if (restaurant.themeSettings) {
                setThemeForm({
                    primaryColor: restaurant.themeSettings.primaryColor || '#f97316',
                    secondaryColor: restaurant.themeSettings.secondaryColor || '#ef4444',
                    fontFamily: restaurant.themeSettings.fontFamily || 'Inter',
                    borderRadius: restaurant.themeSettings.borderRadius || '0.75rem',
                });
            }
        }
    }, [restaurant]);

    const tabs = [
        { id: 'general', label: 'Genel', icon: Building },
        { id: 'location', label: 'Konum', icon: MapPin },
        { id: 'session', label: 'Oturum', icon: Clock },
        { id: 'theme', label: 'Tema', icon: Palette },
        { id: 'security', label: 'Güvenlik', icon: Shield },
    ];

    const handleSaveGeneral = async () => {
        if (!generalForm.name.trim()) {
            toast.error('Restoran adı zorunludur');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.put('/restaurant/profile', generalForm);
            updateRestaurant(response.data.restaurant);
            toast.success('Bilgiler güncellendi');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Güncelleme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveLocation = async () => {
        if (!locationForm.latitude || !locationForm.longitude) {
            toast.error('Konum bilgileri zorunludur');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.patch('/restaurant/location', locationForm);
            updateRestaurant(response.data.restaurant);
            toast.success('Konum ayarları güncellendi');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Güncelleme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSession = async () => {
        if (sessionForm.sessionTimeout < 5 || sessionForm.sessionTimeout > 120) {
            toast.error('Oturum süresi 5-120 dakika arasında olmalıdır');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.patch('/restaurant/settings', {
                sessionTimeout: sessionForm.sessionTimeout,
            });
            updateRestaurant(response.data.restaurant);
            toast.success('Oturum ayarları güncellendi');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Güncelleme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Tüm alanları doldurun');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Yeni şifre en az 6 karakter olmalıdır');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Şifreler eşleşmiyor');
            return;
        }

        setIsLoading(true);
        try {
            await api.patch('/restaurant/settings', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Şifre değiştirildi');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Şifre değiştirilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Tarayıcınız konum özelliğini desteklemiyor');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationForm({
                    ...locationForm,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                toast.success('Konum alındı');
            },
            (error) => {
                toast.error('Konum alınamadı');
            }
        );
    };

    const renderGeneral = () => (
        <Card>
            <CardHeader>
                <h3 className="font-medium text-gray-900">Restoran Bilgileri</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <Input
                    label="Restoran Adı *"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    placeholder="Örn: Bella Italia"
                />
                <Input
                    label="Email"
                    value={restaurant?.email || ''}
                    disabled
                    className="bg-gray-50"
                />
                <Input
                    label="Telefon"
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    placeholder="+90 212 123 4567"
                />
                <Textarea
                    label="Adres"
                    value={generalForm.address}
                    onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                    placeholder="Kadıköy, İstanbul"
                    rows={3}
                />
                <div className="pt-2">
                    <Button onClick={handleSaveGeneral} isLoading={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                </div>
            </CardBody>
        </Card>
    );

    const renderLocation = () => (
        <Card>
            <CardHeader>
                <h3 className="font-medium text-gray-900">Konum Ayarları</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Müşterilerin sipariş verebilmesi için restoran konumunun tanımlanması gerekir.
                </p>
            </CardHeader>
            <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Enlem (Latitude)"
                        type="number"
                        step="any"
                        value={locationForm.latitude || ''}
                        onChange={(e) => setLocationForm({ ...locationForm, latitude: parseFloat(e.target.value) || 0 })}
                        placeholder="40.9876"
                    />
                    <Input
                        label="Boylam (Longitude)"
                        type="number"
                        step="any"
                        value={locationForm.longitude || ''}
                        onChange={(e) => setLocationForm({ ...locationForm, longitude: parseFloat(e.target.value) || 0 })}
                        placeholder="29.0234"
                    />
                </div>
                <Button variant="outline" onClick={getCurrentLocation}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Mevcut Konumu Al
                </Button>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konum Yarıçapı: {locationForm.locationRadius} metre
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={200}
                        step={10}
                        value={locationForm.locationRadius}
                        onChange={(e) => setLocationForm({ ...locationForm, locationRadius: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10m</span>
                        <span>200m</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Müşteriler bu yarıçap içindeyken sipariş verebilir.
                </p>
                <div className="pt-2">
                    <Button onClick={handleSaveLocation} isLoading={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                </div>
            </CardBody>
        </Card>
    );

    const renderSession = () => (
        <Card>
            <CardHeader>
                <h3 className="font-medium text-gray-900">Oturum Ayarları</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Müşteri oturumlarının ne kadar süre aktif kalacağını belirleyin.
                </p>
            </CardHeader>
            <CardBody className="space-y-4">
                <Input
                    label="Oturum Süresi (dakika)"
                    type="number"
                    min={5}
                    max={120}
                    value={sessionForm.sessionTimeout}
                    onChange={(e) => setSessionForm({ ...sessionForm, sessionTimeout: parseInt(e.target.value) || 30 })}
                />
                <p className="text-sm text-gray-500">
                    Müşteri bu süre içinde işlem yapmazsa oturumu sonlanır ve QR kodu tekrar okutması gerekir.
                </p>
                <div className="pt-2">
                    <Button onClick={handleSaveSession} isLoading={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                </div>
            </CardBody>
        </Card>
    );

    const fontOptions = [
        { value: 'Inter', label: 'Inter (Varsayılan)' },
        { value: 'Poppins', label: 'Poppins' },
        { value: 'Nunito', label: 'Nunito' },
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Open Sans', label: 'Open Sans' },
    ];

    const radiusOptions = [
        { value: '0', label: 'Köşeli' },
        { value: '0.375rem', label: 'Hafif Yuvarlak' },
        { value: '0.75rem', label: 'Yuvarlak (Varsayılan)' },
        { value: '1.5rem', label: 'Çok Yuvarlak' },
    ];

    const presetColors = [
        { primary: '#f97316', secondary: '#ef4444', label: 'Turuncu (Varsayılan)' },
        { primary: '#3b82f6', secondary: '#6366f1', label: 'Mavi' },
        { primary: '#10b981', secondary: '#14b8a6', label: 'Yeşil' },
        { primary: '#8b5cf6', secondary: '#a855f7', label: 'Mor' },
        { primary: '#ec4899', secondary: '#f43f5e', label: 'Pembe' },
        { primary: '#eab308', secondary: '#f97316', label: 'Sarı' },
    ];

    const handleSaveTheme = async () => {
        setIsLoading(true);
        try {
            const response = await api.patch('/restaurant/settings', {
                themeSettings: themeForm,
            });
            updateRestaurant(response.data.restaurant);
            toast.success('Tema ayarları güncellendi');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Tema güncellenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const renderTheme = () => (
        <div className="space-y-6">
            {/* Color Presets */}
            <Card>
                <CardHeader>
                    <h3 className="font-medium text-gray-900">Hazır Renk Temaları</h3>
                    <p className="text-sm text-gray-500 mt-1">Hızlıca bir tema seçin veya aşağıdan özelleştirin.</p>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-3 gap-3">
                        {presetColors.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setThemeForm({ ...themeForm, primaryColor: preset.primary, secondaryColor: preset.secondary })}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                    themeForm.primaryColor === preset.primary && themeForm.secondaryColor === preset.secondary
                                        ? 'border-gray-900 ring-1 ring-gray-900'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex gap-1.5 mb-2">
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                </div>
                                <span className="text-xs text-gray-600">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Custom Colors */}
            <Card>
                <CardHeader>
                    <h3 className="font-medium text-gray-900">Özel Renkler</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ana Renk</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={themeForm.primaryColor}
                                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <Input
                                    value={themeForm.primaryColor}
                                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İkincil Renk</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={themeForm.secondaryColor}
                                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <Input
                                    value={themeForm.secondaryColor}
                                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Font & Border Radius */}
            <Card>
                <CardHeader>
                    <h3 className="font-medium text-gray-900">Yazı Tipi ve Köşeler</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Yazı Tipi</label>
                        <select
                            value={themeForm.fontFamily}
                            onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            {fontOptions.map((font) => (
                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Köşe Yuvarlaklığı</label>
                        <div className="grid grid-cols-4 gap-2">
                            {radiusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setThemeForm({ ...themeForm, borderRadius: opt.value })}
                                    className={`p-3 border-2 text-center text-xs transition-all ${
                                        themeForm.borderRadius === opt.value
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    style={{ borderRadius: opt.value }}
                                >
                                    <div
                                        className="w-8 h-8 mx-auto mb-1"
                                        style={{
                                            borderRadius: opt.value,
                                            backgroundColor: themeForm.primaryColor,
                                        }}
                                    />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <h3 className="font-medium text-gray-900">Canlı Önizleme</h3>
                    <p className="text-sm text-gray-500 mt-1">Müşterileriniz menüyü böyle görecek.</p>
                </CardHeader>
                <CardBody>
                    <div className="border rounded-xl overflow-hidden bg-gray-50" style={{ fontFamily: themeForm.fontFamily }}>
                        {/* Preview Header */}
                        <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: themeForm.primaryColor }}>
                                    {restaurant?.name?.charAt(0) || 'R'}
                                </div>
                                <span className="font-bold text-sm text-gray-900">{restaurant?.name || 'Restoran'}</span>
                            </div>
                        </div>
                        {/* Preview Categories */}
                        <div className="px-4 py-2 flex gap-2 overflow-hidden bg-white border-b">
                            <span className="px-3 py-1 text-xs text-white font-medium" style={{ backgroundColor: themeForm.primaryColor, borderRadius: themeForm.borderRadius }}>
                                Burgerler
                            </span>
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 font-medium" style={{ borderRadius: themeForm.borderRadius }}>
                                Pizzalar
                            </span>
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 font-medium" style={{ borderRadius: themeForm.borderRadius }}>
                                İçecekler
                            </span>
                        </div>
                        {/* Preview Menu Item */}
                        <div className="p-4">
                            <div className="bg-white shadow-sm overflow-hidden flex" style={{ borderRadius: themeForm.borderRadius }}>
                                <div className="flex-1 p-3">
                                    <p className="font-medium text-sm text-gray-900">Klasik Burger</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Dana eti, cheddar, marul, domates</p>
                                    <p className="font-bold text-sm mt-1" style={{ color: themeForm.primaryColor }}>₺189</p>
                                </div>
                                <div className="w-20 bg-gray-100 flex items-center justify-center text-2xl relative">
                                    🍔
                                    <div className="absolute bottom-1 right-1 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: themeForm.primaryColor }}>
                                        +
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Preview Cart Bar */}
                        <div className="px-4 pb-3">
                            <div className="text-white py-2 px-4 flex items-center justify-between text-xs font-medium" style={{ backgroundColor: themeForm.primaryColor, borderRadius: themeForm.borderRadius }}>
                                <span>Sepeti Görüntüle (2)</span>
                                <span>₺378.00</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Save Button */}
            <div className="pt-2">
                <Button onClick={handleSaveTheme} isLoading={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Tema Ayarlarını Kaydet
                </Button>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <Card>
            <CardHeader>
                <h3 className="font-medium text-gray-900">Şifre Değiştir</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <div className="relative">
                    <Input
                        label="Mevcut Şifre"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="relative">
                    <Input
                        label="Yeni Şifre"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="relative">
                    <Input
                        label="Yeni Şifre (Tekrar)"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="pt-2">
                    <Button onClick={handleChangePassword} isLoading={isLoading}>
                        <Shield className="w-4 h-4 mr-2" />
                        Şifreyi Değiştir
                    </Button>
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className={`space-y-6 ${activeTab === 'theme' ? 'max-w-3xl' : 'max-w-2xl'}`}>
            {/* Header */}
            <h2 className="text-xl font-semibold text-gray-900">Ayarlar</h2>

            {/* Tabs */}
            <div className="border-b">
                <nav className="flex gap-4 -mb-px">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'location' && renderLocation()}
            {activeTab === 'session' && renderSession()}
            {activeTab === 'theme' && renderTheme()}
            {activeTab === 'security' && renderSecurity()}
        </div>
    );
}

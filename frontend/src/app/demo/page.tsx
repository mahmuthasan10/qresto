'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { Modal } from '@/components/ui';
import {
  QrCode, ShoppingCart, Plus, Minus, Clock, Search, Globe,
  ArrowLeft, Eye, Sparkles, ChefHat, Smartphone,
  MapPin, Utensils
} from 'lucide-react';

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
  icon?: string;
  menuItems: MenuItem[];
}

interface DemoData {
  restaurant: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    themeSettings?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  table: { id: number; tableNumber: string; tableName?: string };
  categories: Category[];
  featuredItems: MenuItem[];
  isDemo: boolean;
}

export default function DemoPage() {
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      const response = await publicApi.get('/public/demo/menu');
      setDemoData(response.data);
    } catch {
      // Fallback: use static data if API is down
      setDemoData(getStaticDemoData());
    } finally {
      setLoading(false);
    }
  };

  const getName = (item: { name: string; nameEn?: string }) =>
    language === 'en' && item.nameEn ? item.nameEn : item.name;

  const getDescription = (item: { description?: string; descriptionEn?: string }) =>
    language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;

  const filteredCategories = demoData?.categories
    .map(cat => ({
      ...cat,
      menuItems: cat.menuItems.filter(item => {
        const name = getName(item).toLowerCase();
        const desc = (getDescription(item) || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      })
    }))
    .filter(cat =>
      (selectedCategory === null || cat.id === selectedCategory) &&
      cat.menuItems.length > 0
    ) || [];

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.item.id !== itemId);
    });
  };

  const handleOrder = () => {
    setShowDemoNotice(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Demo yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!demoData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Modu - Salt Okunur</span>
          </div>
          <Link
            href="/admin/register"
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Kendi Restoranını Oluştur →
          </Link>
        </div>
      </div>

      {/* Restaurant Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'tr' ? 'EN' : 'TR'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{demoData.restaurant.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {language === 'tr' ? 'Demo Masa • Masa DEMO-1' : 'Demo Table • Table DEMO-1'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'tr' ? 'Menüde ara...' : 'Search menu...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {language === 'tr' ? 'Tümü' : 'All'}
          </button>
          {demoData.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.icon} {getName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Items */}
      {selectedCategory === null && !searchQuery && demoData.featuredItems.length > 0 && (
        <div className="max-w-lg mx-auto px-4 mt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {language === 'tr' ? 'Öne Çıkanlar' : 'Featured'}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {demoData.featuredItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex-shrink-0 w-36 bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
              >
                <div className="w-full h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg mb-2 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{getName(item)}</p>
                <p className="text-sm font-bold text-orange-600 mt-1">₺{item.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="max-w-lg mx-auto px-4 mt-4 pb-32">
        {filteredCategories.map(category => (
          <div key={category.id} className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
              {getName(category)}
              <span className="text-sm font-normal text-gray-400">({category.menuItems.length})</span>
            </h2>
            <div className="space-y-3">
              {category.menuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{getName(item)}</h3>
                        {item.preparationTime && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-2">
                            <Clock className="w-3 h-3" />
                            {item.preparationTime} dk
                          </span>
                        )}
                      </div>
                      {getDescription(item) && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{getDescription(item)}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-orange-600">₺{item.price}</span>
                        {item.dietaryInfo?.includes('vegan') && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vegan</span>
                        )}
                        {item.allergens?.length > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {language === 'tr' ? 'Alerjen' : 'Allergen'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-orange-300" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {language === 'tr' ? 'Ekle' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}</p>
          </div>
        )}
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {cartCount} {language === 'tr' ? 'ürün' : 'item(s)'}
                </p>
                <p className="text-lg font-bold text-orange-600">₺{cartTotal.toFixed(2)}</p>
              </div>
            </button>
            <button
              onClick={handleOrder}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors"
            >
              {language === 'tr' ? 'Sipariş Ver' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? getName(selectedItem) : ''}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="w-full h-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
              <Utensils className="w-16 h-16 text-orange-300" />
            </div>

            {getDescription(selectedItem) && (
              <p className="text-gray-600">{getDescription(selectedItem)}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">₺{selectedItem.price}</span>
              {selectedItem.preparationTime && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  ~{selectedItem.preparationTime} {language === 'tr' ? 'dakika' : 'min'}
                </span>
              )}
            </div>

            {selectedItem.allergens?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ {language === 'tr' ? 'Alerjenler' : 'Allergens'}: {selectedItem.allergens.join(', ')}
                </p>
              </div>
            )}

            {selectedItem.dietaryInfo?.length > 0 && (
              <div className="flex gap-2">
                {selectedItem.dietaryInfo.map(info => (
                  <span key={info} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {info}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                addToCart(selectedItem);
                setSelectedItem(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'tr' ? 'Sepete Ekle' : 'Add to Cart'} - ₺{selectedItem.price}
            </button>
          </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title={language === 'tr' ? 'Sepetim' : 'My Cart'}
      >
        <div className="space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {language === 'tr' ? 'Sepetiniz boş' : 'Your cart is empty'}
            </p>
          ) : (
            <>
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{getName(item)}</p>
                    <p className="text-sm text-orange-600 font-semibold">₺{(item.price * quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-900 w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{language === 'tr' ? 'Toplam' : 'Total'}</span>
                <span className="text-xl font-bold text-orange-600">₺{cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleOrder}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors"
              >
                {language === 'tr' ? 'Sipariş Ver' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Demo Notice Modal - shown when user tries to place an order */}
      <Modal
        isOpen={showDemoNotice}
        onClose={() => setShowDemoNotice(false)}
        title={language === 'tr' ? 'Demo Modu' : 'Demo Mode'}
      >
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Eye className="w-10 h-10 text-orange-500" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'tr' ? 'Bu bir demo sayfasıdır!' : 'This is a demo page!'}
            </h3>
            <p className="text-gray-500">
              {language === 'tr'
                ? 'Gerçek sipariş verebilmek için bir restoran hesabı oluşturun, menünüzü ekleyin ve QR kodlarınızı masalara yerleştirin.'
                : 'To place real orders, create a restaurant account, add your menu, and place QR codes on your tables.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <Smartphone className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">{language === 'tr' ? 'QR Okut' : 'Scan QR'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <ShoppingCart className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">{language === 'tr' ? 'Sipariş Ver' : 'Order'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <ChefHat className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">{language === 'tr' ? 'Mutfağa İlet' : 'To Kitchen'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/register"
              className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors text-center"
            >
              {language === 'tr' ? 'Kendi Restoranınızı Oluşturun' : 'Create Your Own Restaurant'}
            </Link>
            <button
              onClick={() => setShowDemoNotice(false)}
              className="block w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              {language === 'tr' ? 'Demoya devam et' : 'Continue demo'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Fallback static data in case API is unavailable
function getStaticDemoData(): DemoData {
  return {
    restaurant: {
      id: 0,
      name: 'QResto Demo Restoran',
      slug: 'demo-restaurant',
      logoUrl: undefined,
      themeSettings: { primaryColor: '#f97316', secondaryColor: '#ef4444' }
    },
    table: { id: 0, tableNumber: 'DEMO-1', tableName: 'Demo Masa' },
    categories: [
      {
        id: 1, name: 'Başlangıçlar', nameEn: 'Starters', icon: '🥗',
        menuItems: [
          { id: 1, name: 'Mercimek Çorbası', nameEn: 'Lentil Soup', description: 'Geleneksel Türk mercimek çorbası', descriptionEn: 'Traditional Turkish lentil soup', price: 65, isAvailable: true, isFeatured: true, allergens: [], dietaryInfo: ['vegan'], preparationTime: 5 },
          { id: 2, name: 'Humus Tabağı', nameEn: 'Hummus Plate', description: 'Nohut püresi, zeytinyağı ile', descriptionEn: 'Chickpea puree with olive oil', price: 55, isAvailable: true, isFeatured: false, allergens: ['gluten'], dietaryInfo: ['vegan'], preparationTime: 5 },
          { id: 3, name: 'Sigara Böreği', nameEn: 'Cheese Rolls', description: 'Çıtır yufka içinde beyaz peynir', descriptionEn: 'Crispy filo pastry with white cheese', price: 75, isAvailable: true, isFeatured: false, allergens: ['gluten', 'dairy'], dietaryInfo: [], preparationTime: 8 },
        ]
      },
      {
        id: 2, name: 'Ana Yemekler', nameEn: 'Main Courses', icon: '🍖',
        menuItems: [
          { id: 4, name: 'Izgara Köfte', nameEn: 'Grilled Meatballs', description: 'El yapımı dana köfte, pilav ile', descriptionEn: 'Handmade beef meatballs with rice', price: 185, isAvailable: true, isFeatured: true, allergens: ['gluten'], dietaryInfo: [], preparationTime: 15 },
          { id: 5, name: 'Tavuk Şiş', nameEn: 'Chicken Skewers', description: 'Marine tavuk, sebzeler ile', descriptionEn: 'Marinated chicken with vegetables', price: 165, isAvailable: true, isFeatured: true, allergens: ['dairy'], dietaryInfo: [], preparationTime: 18 },
          { id: 6, name: 'Karışık Izgara', nameEn: 'Mixed Grill', description: 'Adana, kuşbaşı, pirzola', descriptionEn: 'Adana, cubed meat, chops', price: 320, isAvailable: true, isFeatured: true, allergens: [], dietaryInfo: [], preparationTime: 25 },
        ]
      },
      {
        id: 3, name: 'İçecekler', nameEn: 'Beverages', icon: '🥤',
        menuItems: [
          { id: 7, name: 'Taze Limonata', nameEn: 'Fresh Lemonade', description: 'Ev yapımı, nane ile', descriptionEn: 'Homemade with mint', price: 45, isAvailable: true, isFeatured: true, allergens: [], dietaryInfo: ['vegan'], preparationTime: 3 },
          { id: 8, name: 'Türk Çayı', nameEn: 'Turkish Tea', description: 'Geleneksel demlenmiş çay', descriptionEn: 'Traditional brewed tea', price: 20, isAvailable: true, isFeatured: false, allergens: [], dietaryInfo: ['vegan'], preparationTime: 3 },
          { id: 9, name: 'Türk Kahvesi', nameEn: 'Turkish Coffee', description: 'Cezve usulü, lokumlu', descriptionEn: 'Cezve-brewed with Turkish delight', price: 50, isAvailable: true, isFeatured: false, allergens: [], dietaryInfo: ['vegan'], preparationTime: 5 },
        ]
      },
      {
        id: 4, name: 'Tatlılar', nameEn: 'Desserts', icon: '🍰',
        menuItems: [
          { id: 10, name: 'Künefe', nameEn: 'Kunefe', description: 'Sıcak peynirli, fıstıklı', descriptionEn: 'Hot cheese pastry with pistachio', price: 95, isAvailable: true, isFeatured: true, allergens: ['dairy', 'nuts', 'gluten'], dietaryInfo: [], preparationTime: 12 },
          { id: 11, name: 'Sütlaç', nameEn: 'Rice Pudding', description: 'Fırında kızarmış', descriptionEn: 'Oven-baked', price: 65, isAvailable: true, isFeatured: false, allergens: ['dairy', 'gluten'], dietaryInfo: [], preparationTime: 2 },
          { id: 12, name: 'Baklava', nameEn: 'Baklava', description: 'Antep fıstıklı geleneksel', descriptionEn: 'Traditional with pistachio', price: 110, isAvailable: true, isFeatured: false, allergens: ['nuts', 'gluten', 'dairy'], dietaryInfo: [], preparationTime: 2 },
        ]
      }
    ],
    featuredItems: [],
    isDemo: true,
  };
}

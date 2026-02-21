'use client';

import { useEffect, useState, useRef } from 'react';
import { useMenuStore } from '@/stores/menuStore';
import { Button, Input, Card, CardBody, CardHeader, Badge, Modal, Textarea } from '@/components/ui';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronRight,
    Search,
    ToggleLeft,
    ToggleRight,
    Image as ImageIcon,
    Upload,
    X,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryFormData {
    name: string;
    nameEn?: string;
    icon?: string;
}

interface MenuItemFormData {
    categoryId: number;
    name: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    price: number;
    allergens: string[];
    dietaryInfo: string[];
    preparationTime?: number;
}

export default function MenuPage() {
    const {
        categories,
        menuItems,
        isLoading,
        fetchCategories,
        fetchMenuItems,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        uploadMenuItemImage,
        deleteMenuItemImage,
    } = useMenuStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Category Modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
        name: '',
        nameEn: '',
        icon: '',
    });

    // Menu Item Modal
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemForm, setItemForm] = useState<MenuItemFormData>({
        categoryId: 0,
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: 0,
        allergens: [],
        dietaryInfo: [],
        preparationTime: undefined,
    });

    // Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: number; name: string } | null>(null);

    // Image upload
    const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
        fetchMenuItems();
    }, [fetchCategories, fetchMenuItems]);

    useEffect(() => {
        if (categories.length > 0 && expandedCategories.length === 0) {
            setExpandedCategories([categories[0].id]);
        }
    }, [categories, expandedCategories.length]);

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getItemsByCategory = (categoryId: number) => {
        return filteredItems.filter(item => item.categoryId === categoryId);
    };

    // Category handlers
    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', nameEn: '', icon: '' });
        setShowCategoryModal(true);
    };

    const openEditCategory = (category: any) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            nameEn: category.nameEn || '',
            icon: category.icon || '',
        });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryForm.name.trim()) {
            toast.error('Kategori adı zorunludur');
            return;
        }

        const success = editingCategory
            ? await updateCategory(editingCategory.id, categoryForm)
            : await addCategory(categoryForm);

        if (success) {
            toast.success(editingCategory ? 'Kategori güncellendi' : 'Kategori eklendi');
            setShowCategoryModal(false);
        } else {
            toast.error('İşlem başarısız');
        }
    };

    // Menu Item handlers
    const openAddItem = (categoryId: number) => {
        setEditingItem(null);
        setItemForm({
            categoryId,
            name: '',
            nameEn: '',
            description: '',
            descriptionEn: '',
            price: 0,
            allergens: [],
            dietaryInfo: [],
            preparationTime: undefined,
        });
        setShowItemModal(true);
    };

    const openEditItem = (item: any) => {
        setEditingItem(item);
        setItemForm({
            categoryId: item.categoryId,
            name: item.name,
            nameEn: item.nameEn || '',
            description: item.description || '',
            descriptionEn: item.descriptionEn || '',
            price: item.price,
            allergens: item.allergens || [],
            dietaryInfo: item.dietaryInfo || [],
            preparationTime: item.preparationTime,
        });
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.name.trim()) {
            toast.error('Ürün adı zorunludur');
            return;
        }
        if (itemForm.price <= 0) {
            toast.error('Geçerli bir fiyat girin');
            return;
        }

        const success = editingItem
            ? await updateMenuItem(editingItem.id, itemForm)
            : await addMenuItem(itemForm);

        if (success) {
            toast.success(editingItem ? 'Ürün güncellendi' : 'Ürün eklendi');
            setShowItemModal(false);
        } else {
            toast.error('İşlem başarısız');
        }
    };

    // Delete handlers
    const confirmDelete = (type: 'category' | 'item', id: number, name: string) => {
        setDeleteTarget({ type, id, name });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const success = deleteTarget.type === 'category'
            ? await deleteCategory(deleteTarget.id)
            : await deleteMenuItem(deleteTarget.id);

        if (success) {
            toast.success(`${deleteTarget.type === 'category' ? 'Kategori' : 'Ürün'} silindi`);
        } else {
            toast.error('Silme işlemi başarısız');
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const handleToggleAvailability = async (itemId: number) => {
        const success = await toggleItemAvailability(itemId);
        if (success) {
            toast.success('Durum güncellendi');
        }
    };

    const handleImageUpload = (itemId: number) => {
        setUploadingImageId(itemId);
        imageInputRef.current?.click();
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingImageId) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dosya boyutu 5MB\'dan küçük olmalı');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Sadece resim dosyaları yüklenebilir');
            return;
        }

        const success = await uploadMenuItemImage(uploadingImageId, file);
        if (success) {
            toast.success('Resim yüklendi');
        } else {
            const storeError = useMenuStore.getState().error;
            toast.error(storeError || 'Resim yüklenemedi. Cloudinary ayarlarını kontrol edin.');
        }
        setUploadingImageId(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleImageDelete = async (itemId: number) => {
        const success = await deleteMenuItemImage(itemId);
        if (success) {
            toast.success('Resim silindi');
        } else {
            toast.error('Resim silinemedi');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading && categories.length === 0) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Menü Yönetimi</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={openAddCategory}>
                        <Plus className="w-4 h-4 mr-2" />
                        Kategori
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Hidden file input for image upload */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
            />

            {/* Categories & Items */}
            <div className="space-y-4">
                {categories.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <p className="text-gray-500 mb-4">Henüz kategori eklenmemiş</p>
                            <Button onClick={openAddCategory}>
                                <Plus className="w-4 h-4 mr-2" />
                                İlk Kategoriyi Ekle
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    categories.map(category => {
                        const categoryItems = getItemsByCategory(category.id);
                        const isExpanded = expandedCategories.includes(category.id);

                        return (
                            <Card key={category.id}>
                                {/* Category Header */}
                                <CardHeader
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                            <span className="text-lg">{category.icon || '📁'}</span>
                                            <span className="font-medium text-gray-900">{category.name}</span>
                                            <Badge variant="count" count={categoryItems.length} />
                                        </div>
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openAddItem(category.id)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditCategory(category)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirmDelete('category', category.id, category.name)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Category Items */}
                                {isExpanded && (
                                    <CardBody className="pt-0">
                                        {categoryItems.length === 0 ? (
                                            <p className="text-center text-gray-400 py-4">
                                                Bu kategoride ürün yok
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {categoryItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-center justify-between p-3 rounded-lg border ${item.isAvailable ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer"
                                                                onClick={() => handleImageUpload(item.id)}
                                                                title={item.imageUrl ? 'Resmi değiştir' : 'Resim yükle'}
                                                            >
                                                                {uploadingImageId === item.id ? (
                                                                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                                                ) : item.imageUrl ? (
                                                                    <>
                                                                        <img
                                                                            src={item.imageUrl}
                                                                            alt={item.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Upload className="w-4 h-4 text-white" />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-0.5 group-hover:text-orange-500 transition-colors">
                                                                        <Upload className="w-5 h-5 text-gray-300 group-hover:text-orange-500" />
                                                                        <span className="text-[9px] text-gray-300 group-hover:text-orange-500">Yükle</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-900">
                                                                        {item.name}
                                                                    </span>
                                                                    {item.isFeatured && (
                                                                        <Badge status="confirmed">Öne Çıkan</Badge>
                                                                    )}
                                                                    {!item.isAvailable && (
                                                                        <Badge status="cancelled">Pasif</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                                    {item.description || 'Açıklama yok'}
                                                                </p>
                                                                <p className="text-sm font-semibold text-orange-600">
                                                                    {formatCurrency(item.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {item.imageUrl && (
                                                                <button
                                                                    onClick={() => handleImageDelete(item.id)}
                                                                    className="p-2 hover:bg-red-50 rounded-lg"
                                                                    title="Resmi sil"
                                                                >
                                                                    <X className="w-4 h-4 text-red-400" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleToggleAvailability(item.id)}
                                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                                                title={item.isAvailable ? 'Pasife Al' : 'Aktif Yap'}
                                                            >
                                                                {item.isAvailable ? (
                                                                    <ToggleRight className="w-5 h-5 text-green-500" />
                                                                ) : (
                                                                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                                                                )}
                                                            </button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditItem(item)}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => confirmDelete('item', item.id, item.name)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardBody>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            >
                <div className="space-y-4">
                    <Input
                        label="Kategori Adı *"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Örn: Ana Yemekler"
                    />
                    <Input
                        label="İngilizce Adı"
                        value={categoryForm.nameEn}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                        placeholder="Örn: Main Dishes"
                    />
                    <Input
                        label="İkon (Emoji)"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        placeholder="Örn: 🍕"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSaveCategory} isLoading={isLoading}>
                            Kaydet
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Menu Item Modal */}
            <Modal
                isOpen={showItemModal}
                onClose={() => setShowItemModal(false)}
                title={editingItem ? 'Ürün Düzenle' : 'Yeni Ürün'}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Ürün Adı *"
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            placeholder="Örn: Margherita Pizza"
                        />
                        <Input
                            label="İngilizce Adı"
                            value={itemForm.nameEn}
                            onChange={(e) => setItemForm({ ...itemForm, nameEn: e.target.value })}
                            placeholder="Örn: Margherita Pizza"
                        />
                    </div>

                    <Textarea
                        label="Açıklama"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        placeholder="Ürün açıklaması..."
                        rows={2}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Fiyat (₺) *"
                            type="number"
                            value={itemForm.price || ''}
                            onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                        />
                        <Input
                            label="Hazırlama Süresi (dk)"
                            type="number"
                            value={itemForm.preparationTime || ''}
                            onChange={(e) => setItemForm({ ...itemForm, preparationTime: parseInt(e.target.value) || undefined })}
                            placeholder="15"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori *
                        </label>
                        <select
                            value={itemForm.categoryId}
                            onChange={(e) => setItemForm({ ...itemForm, categoryId: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value={0}>Kategori seçin</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowItemModal(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSaveItem} isLoading={isLoading}>
                            Kaydet
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Silme Onayı"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        <strong>{deleteTarget?.name}</strong> {deleteTarget?.type === 'category' ? 'kategorisini' : 'ürününü'} silmek istediğinizden emin misiniz?
                    </p>
                    {deleteTarget?.type === 'category' && (
                        <p className="text-sm text-red-500">
                            ⚠️ Kategorideki tüm ürünler de silinecektir!
                        </p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            İptal
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Sil
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

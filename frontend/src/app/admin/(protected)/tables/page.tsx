'use client';

import { useEffect, useState, useRef } from 'react';
import { useTableStore } from '@/stores/tableStore';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Card, CardBody, Badge, Modal } from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import {
    Plus,
    Edit2,
    Trash2,
    QrCode,
    Download,
    RefreshCw,
    Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TableFormData {
    tableNumber: number;
    tableName?: string;
    capacity: number;
}

export default function TablesPage() {
    const {
        tables,
        isLoading,
        fetchTables,
        addTable,
        updateTable,
        deleteTable,
        regenerateQR,
    } = useTableStore();

    const { restaurant } = useAuthStore();

    // Table Modal
    const [showTableModal, setShowTableModal] = useState(false);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [tableForm, setTableForm] = useState<TableFormData>({
        tableNumber: 1,
        tableName: '',
        capacity: 4,
    });

    // QR Modal
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const qrRef = useRef<HTMLDivElement>(null);

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    const getMenuUrl = (qrCode: string) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}/menu/${qrCode}`;
    };

    // Table handlers
    const openAddTable = () => {
        const nextNumber = tables.length > 0
            ? Math.max(...tables.map(t => t.tableNumber)) + 1
            : 1;
        setEditingTable(null);
        setTableForm({
            tableNumber: nextNumber,
            tableName: '',
            capacity: 4,
        });
        setShowTableModal(true);
    };

    const openEditTable = (table: any) => {
        setEditingTable(table);
        setTableForm({
            tableNumber: table.tableNumber,
            tableName: table.tableName || '',
            capacity: table.capacity,
        });
        setShowTableModal(true);
    };

    const handleSaveTable = async () => {
        if (tableForm.tableNumber <= 0) {
            toast.error('Geçerli bir masa numarası girin');
            return;
        }
        if (tableForm.capacity <= 0) {
            toast.error('Geçerli bir kapasite girin');
            return;
        }

        const success = editingTable
            ? await updateTable(editingTable.id, tableForm)
            : await addTable(tableForm);

        if (success) {
            toast.success(editingTable ? 'Masa güncellendi' : 'Masa eklendi');
            setShowTableModal(false);
        } else {
            toast.error('İşlem başarısız');
        }
    };

    // QR handlers
    const openQRModal = (table: any) => {
        setSelectedTable(table);
        setShowQRModal(true);
    };

    const handleRegenerateQR = async () => {
        if (!selectedTable) return;

        const newQR = await regenerateQR(selectedTable.id);
        if (newQR) {
            setSelectedTable({ ...selectedTable, qrCode: newQR });
            toast.success('QR kod yenilendi');
        } else {
            toast.error('QR kod yenilenemedi');
        }
    };

    const downloadQR = (format: 'png' | 'svg') => {
        if (!qrRef.current || !selectedTable) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        if (format === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `masa-${selectedTable.tableNumber}-qr.svg`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                canvas.width = 512;
                canvas.height = 512;
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, 512, 512);

                    const pngUrl = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = `masa-${selectedTable.tableNumber}-qr.png`;
                    link.click();
                }
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }

        toast.success(`QR kod ${format.toUpperCase()} olarak indirildi`);
    };

    // Delete handlers
    const confirmDelete = (table: any) => {
        setDeleteTarget(table);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const success = await deleteTable(deleteTarget.id);
        if (success) {
            toast.success('Masa silindi');
        } else {
            toast.error('Silme işlemi başarısız');
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    if (isLoading && tables.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Masa Yönetimi</h2>
                <Button onClick={openAddTable}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Masa
                </Button>
            </div>

            {/* Tables Grid */}
            {tables.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-12">
                        <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">Henüz masa eklenmemiş</p>
                        <Button onClick={openAddTable}>
                            <Plus className="w-4 h-4 mr-2" />
                            İlk Masayı Ekle
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {tables.map(table => (
                        <Card
                            key={table.id}
                            className={`${!table.isActive ? 'opacity-50' : ''} hover:shadow-lg transition-shadow`}
                        >
                            <CardBody className="text-center">
                                {/* Table Number Circle */}
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <span className="text-2xl font-bold text-white">
                                        {table.tableNumber}
                                    </span>
                                </div>

                                {/* Table Info */}
                                <p className="font-medium text-gray-900">
                                    {table.tableName || `Masa ${table.tableNumber}`}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                                    <Users className="w-4 h-4" />
                                    {table.capacity} Kişilik
                                </p>

                                {/* Status Badge */}
                                <div className="mt-2">
                                    <Badge status={table.isActive ? 'confirmed' : 'cancelled'}>
                                        {table.isActive ? 'Aktif' : 'Pasif'}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openQRModal(table)}
                                        title="QR Kod"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditTable(table)}
                                        title="Düzenle"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => confirmDelete(table)}
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Table Modal */}
            <Modal
                isOpen={showTableModal}
                onClose={() => setShowTableModal(false)}
                title={editingTable ? 'Masa Düzenle' : 'Yeni Masa'}
            >
                <div className="space-y-4">
                    <Input
                        label="Masa Numarası *"
                        type="number"
                        value={tableForm.tableNumber}
                        onChange={(e) => setTableForm({ ...tableForm, tableNumber: parseInt(e.target.value) || 0 })}
                        min={1}
                    />
                    <Input
                        label="Masa Adı (Opsiyonel)"
                        value={tableForm.tableName}
                        onChange={(e) => setTableForm({ ...tableForm, tableName: e.target.value })}
                        placeholder="Örn: Bahçe, Teras"
                    />
                    <Input
                        label="Kapasite (Kişi) *"
                        type="number"
                        value={tableForm.capacity}
                        onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 0 })}
                        min={1}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowTableModal(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSaveTable} isLoading={isLoading}>
                            Kaydet
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                title="Masa QR Kodu"
            >
                {selectedTable && (
                    <div className="text-center space-y-4">
                        {/* QR Code */}
                        <div
                            ref={qrRef}
                            className="bg-white p-6 rounded-xl inline-block mx-auto shadow-inner"
                        >
                            <QRCodeSVG
                                value={getMenuUrl(selectedTable.qrCode)}
                                size={200}
                                level="H"
                                includeMargin
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <p className="font-medium text-gray-900">
                                {selectedTable.tableName || `Masa ${selectedTable.tableNumber}`}
                            </p>
                            <p className="text-sm text-gray-500">
                                {restaurant?.name}
                            </p>
                        </div>

                        {/* URL */}
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 break-all">
                                {getMenuUrl(selectedTable.qrCode)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" onClick={() => downloadQR('png')}>
                                <Download className="w-4 h-4 mr-2" />
                                PNG
                            </Button>
                            <Button variant="outline" onClick={() => downloadQR('svg')}>
                                <Download className="w-4 h-4 mr-2" />
                                SVG
                            </Button>
                            <Button variant="ghost" onClick={handleRegenerateQR}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Yenile
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Silme Onayı"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        <strong>Masa {deleteTarget?.tableNumber}</strong> silmek istediğinizden emin misiniz?
                    </p>
                    <p className="text-sm text-orange-500">
                        ⚠️ Bu masaya ait QR kod artık çalışmayacaktır.
                    </p>
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

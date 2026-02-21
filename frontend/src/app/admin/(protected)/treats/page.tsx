'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { Gift, Clock, CheckCircle, Ban, ArrowRight, MessageSquare } from 'lucide-react';

interface Treat {
    id: number;
    fromTableId: number;
    toTableId: number;
    menuItemId: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    note?: string;
    createdAt: string;
    fromTable: {
        tableNumber: string;
    };
    toTable: {
        tableNumber: string;
    };
    menuItem: {
        name: string;
        price: number;
    };
}

export default function TreatsPage() {
    const [treats, setTreats] = useState<Treat[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);

    const fetchTreats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/treats');
            setTreats(response.data);
        } catch (err) {
            console.error('Failed to fetch treats', err);
            setError('İkramlar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreats();

        // Optional: Polling for real-time updates since we don't have socket setup in frontend perfectly yet
        const interval = setInterval(fetchTreats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        if (!confirm('Bu işlemi onaylıyor musunuz?')) return;

        try {
            await api.patch(`/treats/${id}/status`, { status });
            // Optimistic update
            setTreats(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t));
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Durum güncellenemedi.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge status="pending">Bekliyor</Badge>;
            case 'APPROVED':
                return <Badge status="ready">Onaylandı</Badge>;
            case 'REJECTED':
                return <Badge status="cancelled">Reddedildi</Badge>;
            case 'CANCELLED':
                return <Badge status="completed">İptal Edildi</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
        });
    };

    if (loading && treats.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const pendingTreats = treats.filter(t => t.status === 'PENDING');
    const pastTreats = treats.filter(t => t.status !== 'PENDING');

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <Gift size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bekleyen İkramlar</p>
                            <h3 className="text-2xl font-bold">{pendingTreats.length}</h3>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bugün Onaylanan</p>
                            <h3 className="text-2xl font-bold">
                                {treats.filter(t => t.status === 'APPROVED' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
                            </h3>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                            <Gift size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Toplam İkram Tutarı</p>
                            <h3 className="text-2xl font-bold">
                                ₺{treats
                                    .filter(t => t.status === 'APPROVED')
                                    .reduce((sum, t) => sum + Number(t.menuItem.price || 0), 0)
                                    .toFixed(2)}
                            </h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Pending List */}
            {pendingTreats.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="text-orange-500" size={20} />
                        Bekleyen İkramlar
                    </h2>
                    <div className="grid gap-4">
                        {pendingTreats.map(treat => (
                            <Card key={treat.id} className="border-l-4 border-l-purple-500">
                                <CardBody>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                                                <span className="font-bold text-gray-700">Masa {treat.fromTable.tableNumber}</span>
                                                <ArrowRight size={16} className="text-gray-400" />
                                                <span className="font-bold text-purple-600">Masa {treat.toTable.tableNumber}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{treat.menuItem.name}</h4>
                                                <p className="text-sm text-gray-500">₺{treat.menuItem.price}</p>
                                            </div>
                                        </div>

                                        {treat.note && (
                                            <div className="bg-yellow-50 px-3 py-2 rounded text-sm text-yellow-800 flex items-center gap-2 max-w-md">
                                                <MessageSquare size={16} />
                                                <span className="italic">&quot;{treat.note}&quot;</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDate(treat.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(treat.id, 'APPROVED')}
                                                >
                                                    <CheckCircle size={16} className="mr-1" />
                                                    Onayla
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(treat.id, 'CANCELLED')}
                                                >
                                                    <Ban size={16} className="mr-1" />
                                                    İptal Et
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* History List */}
            <section>
                <h2 className="text-lg font-bold text-gray-800 mb-3 mt-8">Geçmiş İkramlar</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Kimden</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Kime</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ürün</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tutar</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Durum</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tarih</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pastTreats.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Henüz geçmiş ikram kaydı bulunmuyor.
                                        </td>
                                    </tr>
                                ) : (
                                    pastTreats.map(treat => (
                                        <tr key={treat.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">Masa {treat.fromTable.tableNumber}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-purple-600">Masa {treat.toTable.tableNumber}</td>
                                            <td className="px-6 py-4 text-sm">{treat.menuItem.name}</td>
                                            <td className="px-6 py-4 text-sm">₺{treat.menuItem.price}</td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(treat.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(treat.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* Actions for past treats? Maybe nothing for now */}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

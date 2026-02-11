import React, { useEffect, useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { publicApi } from '@/lib/api';
import { AlertCircle, User } from 'lucide-react';

interface Table {
    id: number;
    tableNumber: string;
    tableName?: string;
}

interface TableSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (table: Table) => void;
    currentTableId?: number;
    restaurantId?: number; // Depending on API needs
}

export function TableSelectionModal({ isOpen, onClose, onSelect, currentTableId, restaurantId }: TableSelectionModalProps) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTables();
        }
    }, [isOpen]);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError(null);
            // Assuming we can get tables via public endpoint. The controller I made requires 'restaurantId' query param.
            // If we don't have restaurantId handy in props, we might need adjustments.
            // For now assuming we pass it or the endpoint can infer from session (if any).
            // Actually my controller implementation requires restaurantId query param for public access.

            const url = restaurantId
                ? `/public/tables?restaurantId=${restaurantId}&isActive=true`
                : '/public/tables'; // Fallback or different endpoint? 

            // Wait, I created `/api/v1/treats/active-tables` in TreatController which also expected restaurantId.
            // Let's use that one.
            const response = await publicApi.get(`/treats/active-tables${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);
            setTables(response.data);
        } catch (err) {
            console.error('Failed to fetch tables', err);
            setError('Masalar listelenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const filteredTables = currentTableId
        ? tables.filter(t => t.id !== currentTableId)
        : tables;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Hangi Masaya İkram?" size="md">
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-6 text-red-500">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {filteredTables.length === 0 ? (
                            <div className="col-span-2 text-center py-8 text-gray-500">
                                <User className="mx-auto h-10 w-10 mb-2 opacity-50" />
                                <p>Şu an başka aktif masa yok.</p>
                            </div>
                        ) : (
                            filteredTables.map(table => (
                                <button
                                    key={table.id}
                                    onClick={() => onSelect(table)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95"
                                >
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-lg">
                                        🍽️
                                    </div>
                                    <span className="font-bold text-gray-800">Masa {table.tableNumber}</span>
                                    {table.tableName && <span className="text-xs text-gray-500">{table.tableName}</span>}
                                </button>
                            ))
                        )}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t text-center text-sm text-gray-400">
                    İkram ettiğiniz ürün seçtiğiniz masanın hesabına eklenmez, sizin tarafınızdan ödenir.
                </div>
            </div>
        </Modal>
    );
}

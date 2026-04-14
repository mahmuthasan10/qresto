'use client';

import Image from 'next/image';
import { Plus, Minus, Gift } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { MenuItem, TranslateFn } from './types';

interface MenuItemModalProps {
    item: MenuItem | null;
    isTreatMode: boolean;
    lang: 'tr' | 'en';
    t: TranslateFn;
    quantity: number;
    note: string;
    sendingTreat: boolean;
    onClose: () => void;
    onQuantityChange: (qty: number) => void;
    onNoteChange: (note: string) => void;
    onConfirm: (item: MenuItem, quantity: number, note: string) => void;
}

export function MenuItemModal({
    item,
    isTreatMode,
    lang,
    t,
    quantity,
    note,
    sendingTreat,
    onClose,
    onQuantityChange,
    onNoteChange,
    onConfirm,
}: MenuItemModalProps) {
    return (
        <Modal
            isOpen={!!item}
            onClose={onClose}
            title={item ? t(item.name, item.nameEn) : ''}
            size="lg"
        >
            {item && (
                <div>
                    {/* Image */}
                    <div className="h-48 bg-gray-100 -mx-6 -mt-4 mb-4 relative">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <p className="text-2xl font-bold text-orange-600">₺{item.price}</p>

                        {(item.description || item.descriptionEn) && (
                            <p className="text-gray-600">{t(item.description || '', item.descriptionEn)}</p>
                        )}

                        {/* Allergens */}
                        {item.allergens.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    {lang === 'tr' ? 'Alerjenler:' : 'Allergens:'}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {item.allergens.map((a) => (
                                        <span key={a} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                {lang === 'tr' ? 'Özel Not (opsiyonel)' : 'Special Note (optional)'}
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => onNoteChange(e.target.value)}
                                placeholder={lang === 'tr' ? 'Örn: Baharatsız olsun...' : 'E.g.: No spice please...'}
                                className="w-full border rounded-lg p-3 text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Quantity (gizle treat modunda) */}
                        {!isTreatMode && (
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{lang === 'tr' ? 'Adet:' : 'Qty:'}</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => onQuantityChange(quantity + 1)}
                                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button
                            className={`w-full ${isTreatMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                            size="lg"
                            onClick={() => onConfirm(item, quantity, note)}
                            isLoading={sendingTreat}
                        >
                            {isTreatMode ? (
                                <>
                                    <Gift className="w-5 h-5 mr-2" />
                                    {lang === 'tr' ? 'İkram Et' : 'Send Treat'} - ₺{item.price}
                                </>
                            ) : (
                                `${lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'} - ₺${(item.price * quantity).toFixed(2)}`
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

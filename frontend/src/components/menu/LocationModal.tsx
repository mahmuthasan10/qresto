'use client';

import { MapPin } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface LocationModalProps {
    isOpen: boolean;
    sessionStarting: boolean;
    locationError: string | null;
    onStartSession: () => void;
    onStartWithoutLocation: () => void;
}

export function LocationModal({
    isOpen,
    sessionStarting,
    locationError,
    onStartSession,
    onStartWithoutLocation,
}: LocationModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}}
            title="Konum İzni Gerekli"
            showCloseButton={false}
        >
            <div className="text-center py-4">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-orange-500" />
                </div>
                <p className="text-gray-600 mb-6">
                    Sipariş verebilmek için restoranda olduğunuzu doğrulamamız gerekiyor.
                    Lütfen konum izni verin.
                </p>

                {locationError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {locationError}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={onStartSession}
                        isLoading={sessionStarting}
                    >
                        <MapPin className="w-5 h-5 mr-2" />
                        Konumumu Doğrula
                    </Button>

                    <button
                        type="button"
                        onClick={onStartWithoutLocation}
                        disabled={sessionStarting}
                        className="w-full text-sm text-gray-500 underline disabled:opacity-50"
                    >
                        Konum vermeden devam et (garson onayı ile)
                    </button>
                </div>
            </div>
        </Modal>
    );
}

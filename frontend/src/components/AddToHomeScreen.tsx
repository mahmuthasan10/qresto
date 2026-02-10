'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 30 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-700 animate-slide-up">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                aria-label="Kapat"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-orange-600" />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Uygulamayı Yükle
                    </h3>
                    <p className="text-sm text-gray-500">
                        Ana ekranınıza ekleyin, hızlı erişim sağlayın
                    </p>
                </div>

                <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                    Yükle
                </button>
            </div>
        </div>
    );
}

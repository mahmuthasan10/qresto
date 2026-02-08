'use client';

import Link from 'next/link';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-12 h-12 text-gray-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Çevrimdışısınız
                </h1>

                <p className="text-gray-600 mb-8">
                    İnternet bağlantınız yok gibi görünüyor. Lütfen bağlantınızı kontrol edip tekrar deneyin.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Tekrar Dene
                    </button>

                    <Link
                        href="/"
                        className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Ana Sayfa
                    </Link>
                </div>

                <p className="text-sm text-gray-400 mt-8">
                    Sepetinizdeki ürünler kaydedildi ve bağlantı sağlandığında kullanılabilir olacak.
                </p>
            </div>
        </div>
    );
}

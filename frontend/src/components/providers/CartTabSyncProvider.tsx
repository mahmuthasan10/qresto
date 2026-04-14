'use client';

import { useEffect } from 'react';
import { initCartTabSync } from '@/stores/cartStore';

/**
 * Aynı tarayıcıdaki tüm tab'lar arasında sepet senkronizasyonunu başlatır.
 * BroadcastChannel API kullanır — SSR-safe, sadece client'ta çalışır.
 */
export default function CartTabSyncProvider() {
    useEffect(() => {
        const cleanup = initCartTabSync();
        return cleanup;
    }, []);

    return null;
}

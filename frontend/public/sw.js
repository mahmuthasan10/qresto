const CACHE_NAME = 'qresto-v1';
const STATIC_CACHE = 'qresto-static-v1';
const DYNAMIC_CACHE = 'qresto-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API calls (always fetch fresh)
    if (url.pathname.startsWith('/api')) return;

    // Skip WebSocket
    if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached response immediately
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    // Cache the new response
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // If offline and no cache, show offline page
                    if (request.mode === 'navigate') {
                        return caches.match('/offline');
                    }
                    return null;
                });

            return cachedResponse || fetchPromise;
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'Yeni bildiriminiz var',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
        },
        actions: [
            { action: 'open', title: 'Aç' },
            { action: 'close', title: 'Kapat' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'QResto', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    // Get pending orders from IndexedDB and sync
    console.log('[SW] Syncing offline orders...');
}

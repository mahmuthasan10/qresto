/**
 * QResto k6 Yük Testi
 * =====================
 * Senaryo: 100 eş zamanlı müşteri → QR okuma → Session başlatma → Sipariş verme
 * Hedef: p95 response time < 500ms, hata oranı < %1
 *
 * Kullanım:
 *   k6 run tests/k6/load_test.js
 *   k6 run --env BASE_URL=https://your-railway-url.up.railway.app tests/k6/load_test.js
 *
 * k6 kurulumu: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Özel metrikler ───────────────────────────────────────────────────────────
const errorRate   = new Rate('error_rate');
const orderTrend  = new Trend('order_duration_ms', true);
const menuTrend   = new Trend('menu_load_ms', true);
const sessionTrend = new Trend('session_start_ms', true);

// ─── Test yapılandırması ──────────────────────────────────────────────────────
export const options = {
    scenarios: {
        // Ramping: 0 → 100 kullanıcı → 0 (3 dakika)
        ramp_up_orders: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20  }, // Yavaş yavaş yükle
                { duration: '60s', target: 100 }, // Zirveye ulaş
                { duration: '60s', target: 100 }, // Sabit tut
                { duration: '30s', target: 0   }, // Ramping down
            ],
        },
    },

    thresholds: {
        // p95 altında tüm istekler 500ms'den kısa olmalı
        http_req_duration: ['p(95)<500'],
        // Hata oranı %1'den az olmalı
        error_rate: ['rate<0.01'],
        // Sipariş endpoint'i özelinde
        order_duration_ms: ['p(95)<800'],
        // Menü cache'li olduğunda çok hızlı yüklenmeli
        menu_load_ms: ['p(95)<200'],
    },
};

// ─── Test verisi (gerçek QR kod + menu item ID girin) ─────────────────────────
const BASE_URL     = __ENV.BASE_URL     || 'http://localhost:3001/api/v1';
const TEST_QR_CODE = __ENV.TEST_QR_CODE || 'test-qr-table-1';
const MENU_ITEM_ID = parseInt(__ENV.MENU_ITEM_ID || '1');

const HEADERS = { 'Content-Type': 'application/json' };

// ─── Ana test akışı ───────────────────────────────────────────────────────────
export default function () {
    // 1. Menüyü yükle (cache test)
    const menuStart = Date.now();
    const menuRes = http.get(`${BASE_URL}/public/menu/${TEST_QR_CODE}`, { headers: HEADERS });
    menuTrend.add(Date.now() - menuStart);

    const menuOk = check(menuRes, {
        'menu status 200': (r) => r.status === 200,
        'menu has categories': (r) => {
            try {
                return JSON.parse(r.body).categories?.length > 0;
            } catch {
                return false;
            }
        },
    });
    errorRate.add(!menuOk);

    if (!menuOk) {
        sleep(1);
        return;
    }

    sleep(0.5); // Kullanıcı menüye bakıyor

    // 2. Session başlat (konum doğrulaması dev'de bypass edilir)
    const sessionStart = Date.now();
    const sessionRes = http.post(
        `${BASE_URL}/sessions/start`,
        JSON.stringify({
            qrCode: TEST_QR_CODE,
            // Dev ortamında konum gönderilmese de oturum açılır
        }),
        { headers: HEADERS }
    );
    sessionTrend.add(Date.now() - sessionStart);

    const sessionOk = check(sessionRes, {
        'session started': (r) => r.status === 201,
        'has session token': (r) => {
            try {
                return !!JSON.parse(r.body).session?.token;
            } catch {
                return false;
            }
        },
    });
    errorRate.add(!sessionOk);

    if (!sessionOk) {
        sleep(1);
        return;
    }

    let sessionToken;
    try {
        sessionToken = JSON.parse(sessionRes.body).session.token;
    } catch {
        errorRate.add(true);
        sleep(1);
        return;
    }

    sleep(1); // Kullanıcı ürün seçiyor

    // 3. Sipariş ver
    const orderStart = Date.now();
    const orderRes = http.post(
        `${BASE_URL}/public/orders`,
        JSON.stringify({
            sessionToken,
            items: [
                { menuItemId: MENU_ITEM_ID, quantity: 1, notes: 'k6 test' },
            ],
            paymentMethod: 'cash',
            customerNotes: 'k6 load test order',
        }),
        { headers: HEADERS }
    );
    orderTrend.add(Date.now() - orderStart);

    const orderOk = check(orderRes, {
        'order placed 201': (r) => r.status === 201,
        'has order number': (r) => {
            try {
                return !!JSON.parse(r.body).order?.orderNumber;
            } catch {
                return false;
            }
        },
    });
    errorRate.add(!orderOk);

    sleep(2); // Kullanıcı sipariş onayını bekliyor
}

// ─── Özet raporu ──────────────────────────────────────────────────────────────
export function handleSummary(data) {
    const p95 = data.metrics?.http_req_duration?.values?.['p(95)'];
    const errRate = data.metrics?.error_rate?.values?.rate;

    const passed = p95 < 500 && errRate < 0.01;

    console.log('\n' + '═'.repeat(60));
    console.log('QResto Load Test Özeti');
    console.log('═'.repeat(60));
    console.log(`Durum       : ${passed ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`);
    console.log(`p95 Latency : ${Math.round(p95)}ms (hedef: <500ms)`);
    console.log(`Hata Oranı  : ${(errRate * 100).toFixed(2)}% (hedef: <%1)`);
    console.log('═'.repeat(60) + '\n');

    return {
        'tests/k6/results/summary.json': JSON.stringify(data, null, 2),
        stdout: '',
    };
}

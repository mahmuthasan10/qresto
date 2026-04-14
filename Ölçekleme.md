# QResto - Kapsamli Analiz ve Eylem Plani

## Context

QResto, B2B2C modelinde QR kod tabanli bir restoran siparis sistemidir. Musteriler masadaki QR kodu okutarak menu goruntuler, siparis verir ve odeme yapar. Sistem Next.js 16 (frontend) + Express 5 (backend) + PostgreSQL 16 + Socket.io + Redis uzerinde calisir. Proje hafta 8 asamasinda, beta oncesi son duzeltmeler yapiliyor.

---

## 1. MEVCUT KOD BAZASI ANALIZI (Codebase Audit)

### 1.1 Kritik Ihlaller (P0)

| # | Sorun | Dosya | Aciklama |
|---|-------|-------|----------|
| A | **Debug endpoint'leri production'da acik** | `backend/src/routes/public.routes.js:6-99` | `/debug/test-data` ve `/debug/seed-test` endpoint'leri hicbir `NODE_ENV` kontrolu olmadan herkese acik. Saldirgan restoran/masa verisi olusturabilir. |
| B | **Socket.io auth yok** | `backend/src/index.js:158-176` | `io.on('connection')` icinde JWT/session dogrulama yok. Herkes `join_restaurant` ile herhangi bir restoran odasina katilip siparis verilerini gorebilir. |
| C | **calculateDistance fonksiyonu cift yazilmis (DRY ihlali)** | `backend/src/controllers/session.controller.js` + `backend/src/controllers/public.controller.js` | Ayni Haversine hesabi iki dosyada tekrarlaniyor. |

### 1.2 Orta Oncelik Ihlaller (P1)

| # | Sorun | Dosya | Aciklama |
|---|-------|-------|----------|
| D | **SRP ihlali - 500+ satirlik tek component** | `frontend/src/app/menu/[qrCode]/page.tsx` | Menu goruntuleme, sepet, treat, session, lokasyon, dil, arama hepsi tek dosyada. En az 5 alt component'e bolunmeli. |
| E | **Order cancellation DELETE kullanmasi** | `backend/src/routes/order.routes.js:31` | `router.delete('/:id')` -- siparis silinmiyor, status degisiyor. `PATCH /orders/:id/cancel` olmali. Frontend'de `api.delete` ile body gonderme de sorunlu. |
| F | **generateOrderNumber race condition** | `backend/src/controllers/public.controller.js` | `count` sorgusu + `count + 1` ile numara uretimi. Esanli siparislerde cakisma olur. `@unique` constraint hataya sebep olur ama kullanici deneyimini bozar. |
| G | **Session extend sinirsiz** | `backend/src/controllers/session.controller.js` | Rate limit yok, max uzatma siniri yok. Surekli cagrilarak session sonsuza kadar uzatilabilir. |
| H | **Tekrarlanan error handling pattern** | Tum store dosyalari | 20+ yerde ayni `(unknownError) => { const error = unknownError as AxiosError<...> }` pattern'i. Global utility olmali. |

### 1.3 Dusuk Oncelik (P2)

| # | Sorun | Dosya | Aciklama |
|---|-------|-------|----------|
| I | **Kullanilmayan AWS SDK** | `backend/package.json` | `@aws-sdk/client-s3` ve `@aws-sdk/lib-storage` yuklu ama Cloudinary'ye gecilmis. |
| J | **Kitchen notification sesi** | `frontend/src/stores/kitchenStore.ts` | `AudioContext` oscillator kullanimi iOS Safari'de kullanici etkilesimi olmadan calismaz. |
| K | **`any` type kullanimi** | `frontend/src/lib/socket.ts`, menu page | Event callback'leri ve catch bloklari tiplanmamis. |

### 1.4 Mimari Guclu Yanlar

- Zustand persist middleware ile state kaliciligi dogru uygulanmis (`cartStore.ts`)
- SSR hydration `_hasHydrated` + `onRehydrateStorage` ile temiz cozulmus
- Multi-tenant izolasyon: Her sorgu `restaurantId` ile filtreleniyor
- Redis fallback: Socket.io adapter Redis baglanamazsa in-memory'ye dusuyor
- Rate limiting: Auth endpoint'lerinde agresif (5/15dk), genel API'de makul (100/dk)
- Prisma decimal -> Number donusumu JSON serialization icin dogru yapilmis

---

## 2. MIMARI VE GUVENLIK INCELEMESI

### 2.1 QR Kod Guvenligi - Sahte Siparis Engelleme

**Mevcut Durum:**
- QR kod statik UUID (`table.qrCode` alani) -- fotografini ceken sonsuza kadar kullanabilir
- GPS kontrolu var AMA: `NODE_ENV === 'development'` ise tamamen atlaniyor, `accuracy` parametresi istemciden geliyor ve 500m'ye kadar manipule edilebilir
- `startSessionWithoutLocation` secegiyle lokasyon kontrolu atlanabiliyor

**Onerilen Katmanli Guvenlik Sistemi:**

**Katman 1 - Rotating QR Token (En Etkili):**
```
QR URL: /menu/{tableQR}?nonce={rotating-token}
Backend: Redis'te nonce'u 5 dk TTL ile tut
Dogrulama: Session baslatirken nonce gecerliligi kontrol et
```
- Bu restoran disinda QR fotografi ile erisimi engeller
- Restoran admin paneline "QR Yenile" butonu zaten var, bunu otomatik hale getirmek yeterli

**Katman 2 - Geolocation Sertlestirmesi:**
- Production'da lokasyon kontrolunu zorunlu yap
- `accuracy` toleransini sunucu tarafinda max 100m ile sinirla (mevcut 500m cok yuksek)
- Formula: `effectiveRadius = restaurant.locationRadius + min(clientAccuracy, 100)`

**Katman 3 - Session Binding:**
- Session'i User-Agent + IP hash'ine bagla (`deviceInfo` zaten kaydediliyor ama dogrulanmiyor)
- Session verify/extend'de ayni cihaz kontrolu

**Katman 4 - Rate Limiting per Table:**
- Ayni masa icin dakikada max 2 session baslama istegi

### 2.2 Real-time Mimari - Vercel Serverless Sorunu

**Sorun:** Socket.io persistent connection gerektiriyor. Vercel serverless fonksiyonlari max 30sn yasiyor.

**Mimari Alternatifler:**

| Secenek | Maliyet (100 resto) | Degisiklik Miktari | Gecikme |
|---------|---------------------|---------------------|---------|
| **1. Backend Railway'de Socket.io korusun** | ~$5-10/ay | Sifir | <100ms |
| 2. Pusher Channels | ~$49/ay | Orta (SDK degisimi) | <200ms |
| 3. Supabase Realtime | ~$25/ay | Yuksek (DB degisimi) | <300ms |
| 4. SSE + Polling hybrid | $0 ek | Orta | 1-3sn |

**Oneri: Secenek 1.** Backend zaten Railway'de deploy edilecek. Socket.io ayni Express process icinde calisiyor (`backend/src/index.js`). Frontend Vercel'de host edilse bile, Socket.io baglantisi dogrudan Railway backend'ine gider. `NEXT_PUBLIC_SOCKET_URL` ortam degiskeni Railway URL'sini gosterir. Mevcut `lib/socket.ts` kodu degismez.

Musteri siparis takibi icin ek olarak polling fallback (15sn aralik) eklemek, Socket.io baglantisi koparsa bile siparis durumu guncellemelerini garantiler.

### 2.3 Sepet Yonetimi (Cart Persistence)

**Mevcut Durum: Iyi implemente edilmis.**
- `cartStore.ts` Zustand `persist` middleware ile localStorage'a yaziliyor
- `_hasHydrated` flag'i SSR hydration mismatch'i onluyor
- `onRehydrateStorage` hata durumunda store'u sifirliyor
- `ensureTable()` QR degistiginde veya session suresi dolunca sepeti temizliyor

**Iyilestirme Onerileri:**
1. **Tab senkronizasyonu:** Ayni tarayicida birden fazla tab aciksa `BroadcastChannel` API ile senkronize etmek
2. **Session-scoped storage key:** `name: 'cart-storage'` yerine `name: \`cart-${qrCode}\`` -- farkli masalar arasi izolasyon
3. **Expiry kontrolunu periyodik yapmak:** Mevcut kontrol sadece `ensureTable` cagrildiginda calisiyor. `setInterval` ile her 60sn kontrol eklemek

---

## 3. PAZAR VE ANTI-PATTERN ARASTIRMASI

### 3.1 QR Siparis Sistemlerindeki 3 Buyuk Teknik Hata

**1. "Kayip Sepet" Sorunu (Session Timeout)**
- Sorun: Musteri 15-20 dk menude gezindikten sonra siparis vermeye calistiginda session expired. Sepet bos.
- QResto riski: 30 dk timeout var, ama aktif kullanici bile timeout'a takili.
- **Cozum:** Session'i "lazy-extend" yapmak. Her API cagrisinda (menu goruntuleme, sepete ekleme) session'i otomatik 10 dk uzatmak. Backend `public` route middleware'i olarak implement edilir.

**2. Buyuk Menu Yukleme Performansi**
- Sorun: `getMenuByQR` tum kategoriler + tum menu ogeleri tek sorguda. 100+ urun = yavas yuklenme + buyuk payload.
- **Cozum:** Ilk yukleme: sadece kategoriler + featured items. Kategori seciminde lazy-load. Menu verisini Redis'te 5 dk cache'le.

**3. Siparis Sonrasi Feedback Eksikligi**
- Sorun: Musteri siparis sonrasi `order/[orderNumber]` sayfasinda Socket.io yoksa guncelleme alamaz.
- **Cozum:** Polling fallback (15sn) + ileride Web Push API.

### 3.2 UX Darbogazlari (Donusum Oranini Dusurenler)

**1. Lokasyon Izni Engeli (Conversion Killer #1)**
- Mobil kullanicilarin ~30%'i lokasyon iznini reddeder.
- Mevcut: Lokasyon reddedilirse `startSessionWithoutLocation` ile devam ediliyor (guvenlik riski).
- **Oneri:** Lokasyon kontrolunu dogrudan QR rotating token'a baglamak. Token gecerliyse zaten restoran icinde. Lokasyon sadece ek dogrulama.

**2. Online Odeme Eksikligi**
- Mevcut: Sadece `cash` ve `card_at_table` secenekleri (`public.controller.js`).
- QR siparis sistemlerinde online odeme olmamasi donusum oranini ~%40 dusurur.
- **Oneri:** Hafta 3-4'te iyzico entegrasyonu planlamak.

**3. Cok Fazla Navigasyon Adimi**
- Mevcut: Menu -> Sepet sayfasi -> Odeme secimi -> Onay -> Yonlendirme (4 adim).
- **Oneri:** Menu icinde bottom sheet ile inline checkout. Ayri cart sayfasina gitme ihtiyacini ortadan kaldirma.

### 3.3 UI Component Performans Iyilestirmeleri

1. **Image Priority:** Featured menu items icin `<Image priority={true}>` -- LCP iyilestirmesi
2. **Scroll Spy:** Kategori scroll'unda Intersection Observer ile aktif kategori otomatik degisimi
3. **Zustand Selector:** `useCartStore()` yerine `useCartStore((s) => s.items.length)` -- gereksiz re-render onleme
4. **Button/Input memo:** Sik render edilen form component'lerinde `React.memo` ile wrap

---

## 4. ILK 1000 KULLANICI ICIN OLCEKLEME

### 4.1 Veritabani: PostgreSQL + Prisma Dogrulama

**PostgreSQL dogru secim. Nedenleri:**
- JSON/JSONB destegi (menu metadata, theme settings)
- Full-text search (menu arama)
- PostGIS eklentisi (gelecekte gelismis lokasyon sorgulari)
- ACID uyumlu (finansal islemler icin kritik)
- Prisma ile mukemmel entegrasyon

**Kapasite Hesabi (100 restoran, 1000 esanli musteri):**
- Gunluk siparis: ~5000 (100 resto x 50 siparis)
- Concurrent DB baglantisi: ~200 (worst case)
- Prisma default pool: 5 baglanti -- **yetersiz**

**Aksiyonlar:**
1. Connection pool artirmak: `DATABASE_URL` sonuna `?connection_limit=20&pool_timeout=10`
2. Eksik index eklemek:
   - `Session`: `(restaurantId, isActive, expiresAt)` compound index
   - `Treat`: `(status, createdAt)` compound index
3. `generateOrderNumber` icin Redis atomic counter: `INCR qresto:order:{restaurantId}:{YYYYMMDD}`

### 4.2 Deployment Maliyet Analizi (Vercel + Railway)

| Servis | Platform | Plan | Tahmini Maliyet |
|--------|----------|------|-----------------|
| Frontend | Vercel | Pro | $20/ay |
| Backend + Socket.io | Railway | Pro | $10-20/ay |
| PostgreSQL | Railway | Included | $5-10/ay |
| Redis | Upstash | Free/Pay-as-go | $0-10/ay |
| Cloudinary | Free tier | 25GB | $0 |
| **Toplam** | | | **$35-60/ay** |

**Maliyet Optimizasyonu:**
1. **ISR (Incremental Static Regeneration):** `menu/[qrCode]` sayfasini 5 dk revalidate ile statik hale getirmek. Vercel serverless cagrilarini %80 azaltir.
2. **Menu cache:** Backend'de Redis ile menu verisini 5 dk cache'lemek. DB sorgu sayisini drastik dusurur.
3. **Image CDN:** Cloudinary zaten CDN. Next.js Image component otomatik optimize ediyor.

### 4.3 Hedef Altyapi Mimarisi

```
[Musteri Mobil] ---> [Vercel CDN (ISR)] ---> [Statik Menu HTML]
                                          \
                                           --> [Railway: Express API + Socket.io]
                                                    |          |
[Admin Panel] ---> [Vercel] ------------------>     |          |
                                                    v          v
[Mutfak KDS] <--- [Socket.io] <---          [PostgreSQL]  [Redis/Upstash]
```

---

## 5. 4 HAFTALIK GELISTIRME YOLHARITASI

### HAFTA 1: GUVENLIK SERTLESTIRMESI + KRITIK BUGLAR

**Gun 1-2: Acil Guvenlik Yamalari**

| Task | Dosya | Detay |
|------|-------|-------|
| Debug endpoint'leri kapatmak | `backend/src/routes/public.routes.js:6-99` | `NODE_ENV !== 'development'` guard'i ekle veya route'lari sil |
| Socket.io auth middleware | `backend/src/index.js:158-176` | `io.use()` middleware ile JWT/session token dogrula, `join_restaurant` icin yetki kontrolu |
| Session extend sinirlamasi | `backend/src/controllers/session.controller.js` | Max 3 uzatma, min 2 dk aralik, `extensionCount` alani (Prisma migration) |

**Gun 3-4: Auth & Token Iyilestirmeleri**

| Task | Dosya | Detay |
|------|-------|-------|
| Geolocation sertlestirme | `backend/src/controllers/session.controller.js` | Production'da lokasyon zorunlu, accuracy max 100m |
| Table basina session limiti | `backend/src/controllers/session.controller.js` | Ayni masa icin max 3 concurrent session |

**Gun 5: DRY Refactoring**

| Task | Dosya | Detay |
|------|-------|-------|
| `calculateDistance` utility | `backend/src/utils/geo.js` (yeni) | Haversine fonksiyonunu tek yere tasi, her iki controller'dan kullan |
| Error handling utility | `frontend/src/lib/handleApiError.ts` (yeni) | Global `handleApiError(error: unknown): string` fonksiyonu |

---

### HAFTA 2: MIMARI IYILESTIRMELER + PERFORMANS

**Gun 1-2: API Degisiklikleri**

| Task | Dosya | Detay |
|------|-------|-------|
| Order cancel: DELETE -> PATCH | `backend/src/routes/order.routes.js`, `frontend/src/stores/orderStore.ts` | `PATCH /orders/:id/cancel` endpoint'i olustur |
| Order number race condition | `backend/src/controllers/public.controller.js` | Redis atomic counter (`INCR`) veya PostgreSQL sequence kullan |

**Gun 3-4: Menu Performansi**

| Task | Dosya | Detay |
|------|-------|-------|
| Menu Redis cache | `backend/src/controllers/public.controller.js` | `getMenuByQR` sonucunu Redis'te 5 dk cache'le, menu guncellediginde invalidate et |
| Lazy category loading | `frontend/src/app/menu/[qrCode]/page.tsx` | Ilk yukleme: kategoriler + featured. Sonra kategori bazli lazy-load |

**Gun 5: Kod Kalitesi**

| Task | Dosya | Detay |
|------|-------|-------|
| Menu page bolme | `frontend/src/app/menu/[qrCode]/page.tsx` | `MenuContent`, `MenuItemModal`, `LocationModal`, `TreatFlow`, `useMenuData` hook olarak ayir |
| Unused deps temizligi | `backend/package.json` | `@aws-sdk/client-s3`, `@aws-sdk/lib-storage` kaldir |

---

### HAFTA 3: UX IYILESTIRMELERI

**Gun 1-2: Session & Cart UX**

| Task | Dosya | Detay |
|------|-------|-------|
| Session lazy-extend | Backend public route middleware | Her API cagrisinda session'i otomatik uzat |
| Cart tab senkronizasyonu | `frontend/src/stores/cartStore.ts` | `BroadcastChannel` API ile tab'lar arasi senkronizasyon |

**Gun 3-4: Siparis Takibi**

| Task | Dosya | Detay |
|------|-------|-------|
| Polling fallback | `frontend/src/app/order/[orderNumber]/page.tsx` | Socket.io yoksa 15sn aralikla GET polling |
| Inline checkout (bottom sheet) | `frontend/src/app/menu/[qrCode]/page.tsx` | Menu icinde sepet ozeti + "Siparisi Tamamla" bottom sheet |

**Gun 5: UI Performans**

| Task | Dosya | Detay |
|------|-------|-------|
| Image priority | Menu page | Featured items: `priority={true}` |
| Scroll spy | Menu page | Intersection Observer ile aktif kategori |
| Zustand selectors | Tum component'ler | Gereksiz re-render onleme |

---

### HAFTA 4: MONITORING + OLCEKLEME HAZIRLIGI

**Gun 1-2: Veritabani Tuning**

| Task | Dosya | Detay |
|------|-------|-------|
| Connection pool | Backend `.env` | `?connection_limit=20&pool_timeout=10` |
| Eksik index'ler | `backend/prisma/schema.prisma` | Session + Treat compound index'leri (Prisma migration) |

**Gun 3-4: Monitoring & Error Tracking**

| Task | Dosya | Detay |
|------|-------|-------|
| Sentry entegrasyonu | Frontend + Backend | Client-side ve server-side error tracking |
| Health check genisletme | `backend/src/index.js` | DB + Redis baglanti durumu, bellek kullanimi |

**Gun 5: Load Test & Deployment Checklist**

| Task | Detay |
|------|-------|
| k6 load test | 100 concurrent siparis, response time < 500ms hedefi |
| Railway deployment pipeline | CI/CD: GitHub push -> auto deploy |
| Production checklist | ENV degiskenleri, CORS, HTTPS, rate limit final kontrol |

---

## ONCELIK MATRISI (Ozet)

| Oncelik | Task | Etki | Efor |
|---------|------|------|------|
| **P0** | Debug endpoint'leri kapatmak | Guvenlik - Kritik | 30 dk |
| **P0** | Socket.io auth middleware | Guvenlik - Kritik | 2-3 saat |
| **P0** | Session extend siniri | Guvenlik | 1-2 saat |
| **P1** | Order cancel DELETE->PATCH | Mimari | 1-2 saat |
| **P1** | Menu Redis cache | Performans | 3-4 saat |
| **P1** | Order number race condition | Bug | 2-3 saat |
| **P2** | Menu page refactoring | Kod kalitesi | 4-6 saat |
| **P2** | Inline checkout | UX/Donusum | 6-8 saat |
| **P2** | Session lazy-extend | UX | 3-4 saat |
| **P3** | Sentry entegrasyonu | Monitoring | 2-3 saat |
| **P3** | ISR/SSG menu pages | Performans | 4-6 saat |

---

## Kritik Dosyalar

- `backend/src/index.js` -- Socket.io auth, debug route kontrol
- `backend/src/routes/public.routes.js` -- Debug endpoint'leri
- `backend/src/controllers/public.controller.js` -- Order creation, menu cache, geolocation
- `backend/src/controllers/session.controller.js` -- Session extend, concurrent limit, geolocation
- `frontend/src/app/menu/[qrCode]/page.tsx` -- SRP refactoring, inline checkout, UX
- `frontend/src/stores/cartStore.ts` -- Tab sync, session-scoped key
- `frontend/src/lib/api.ts` -- Token yonetimi, session auto-extend
- `frontend/src/lib/socket.ts` -- Auth token gonderimi
- `backend/prisma/schema.prisma` -- Index ve migration degisiklikleri

## Dogrulama Plani

1. **Guvenlik testleri:** Debug endpoint'lerinin production'da 404 dondurdugunu dogrula. Socket.io'ya auth olmadan baglanmayi dene, reddedildigini dogrula.
2. **Performans testleri:** Menu yukleme suresi (cache oncesi vs sonrasi). k6 ile 100 concurrent siparis.
3. **UX testleri:** Session timeout senaryosu (30 dk bekleme). Farkli tarayici tab'larinda sepet senkronizasyonu. Inline checkout akisi.
4. **Cypress E2E:** Mevcut test suite'ini calistir, regression olmadigini dogrula.

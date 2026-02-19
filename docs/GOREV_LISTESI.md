# 🍽️ QResto - Detaylı Görev Listesi

> Bu liste orijinal proje planına dayalıdır. Her görev tamamlandığında `[x]` olarak işaretleyin.
> Devam eden görevler için `[/]` kullanın.

---

## 📅 HAFTA 1-2: PLANLAMA VE TASARIM

### Hafta 1 - Pazar Araştırması ve Analiz

#### Kullanıcı Araştırması
- [x] Restoran sahipleriyle mülakat yapma (5-10 kişi)
  - [x] Mevcut sipariş süreçlerini anlama
  - [x] En büyük sorunları tespit etme
  - [x] Bütçe beklentilerini öğrenme
  - [x] Teknoloji kullanım alışkanlıklarını belirleme
- [x] Müşteri (son kullanıcı) mülakatiları
  - [x] Restoranlarda yaşanan bekleme problemleri
  - [x] Dijital menü deneyimleri
- [x] Mutfak/garson personeli görüşmeleri
  - [x] Sipariş alma zorlukları
  - [x] Mevcut iş akışı

#### Rakip Analizi
- [x] Menulux analizi
  - [x] Fiyatlandırma yapısı
  - [x] Özellik seti
  - [x] Güçlü/zayıf yönler
- [x] GetMenu analizi
- [x] QR Menu Türkiye analizi
- [x] Diğer yerel çözümler
- [x] Feature karşılaştırma tablosu oluşturma
- [x] Fiyat karşılaştırma tablosu

#### Teknik Planlama
- [x] Kullanıcı hikayeleri (User Stories) yazma
  - [x] Restoran sahibi hikayeleri
  - [x] Müşteri hikayeleri
  - [x] Mutfak personeli hikayeleri
- [x] User flow diyagramları çizme
  - [x] Müşteri sipariş akışı
  - [x] Admin menü güncelleme akışı
  - [x] Mutfak sipariş işleme akışı
- [x] Teknik stack finalize etme
  - [x] Backend: Node.js 20 + Express 4.18 + Prisma
  - [x] Frontend: Next.js 14 + React 18 + Tailwind CSS
  - [x] Database: PostgreSQL 16
  - [x] Cache: Redis 7
  - [x] Real-time: Socket.io
- [x] Proje klasör yapısı tasarımı

**Çıktılar:**
- [x] PRD (Product Requirements Document)
- [x] User Personas (3 adet)
- [x] User Journey Maps
- [x] Technical Architecture Diagram (Mermaid)

---

### Hafta 2 - UI/UX Tasarımı

#### Wireframe Tasarımı
- [x] Müşteri Arayüzü Wireframe
  - [x] QR okutma ve lokasyon izni ekranı
  - [x] Menü listesi sayfası
  - [x] Ürün detay modal
  - [x] Sepet sayfası
  - [x] Sipariş takip sayfası
  - [x] Oturum süresi uyarı modal
- [x] Admin Panel Wireframe
  - [x] Login sayfası
  - [x] Dashboard sayfası
  - [x] Menü yönetimi sayfası
  - [x] Masa yönetimi sayfası
  - [x] Sipariş listesi sayfası
  - [x] Ayarlar sayfası
- [x] Mutfak Ekranı Wireframe
  - [x] Sipariş kartları görünümü (3 kolon)
  - [x] Durum geçiş butonları

#### High-Fidelity Mockup (Figma)
- [x] Design System oluşturma
  - [x] Renk paleti (Primary, Secondary, Accent, Neutral)
  - [x] Typography (Font ailesi, boyutları, ağırlıkları)
  - [x] Spacing sistemi (4px grid)
  - [x] Border radius değerleri
  - [x] Shadow değerleri
- [x] Component Library
  - [x] Button (Primary, Secondary, Danger, Ghost)
  - [x] Input (Text, Number, Search, Textarea)
  - [x] Card (Product, Order, Stat)
  - [x] Modal (Confirmation, Form, Alert)
  - [x] Navigation (Tabs, Sidebar, Bottom Bar)
  - [x] Badge (Status, Count)
  - [x] Toast (Success, Error, Warning, Info)
- [ ] Responsive tasarımlar
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1280px)

**Çıktılar:**
- [ ] Figma dosyası (tüm ekranlar)
- [x] Style Guide dokümanı
- [x] Component Library



---

## 📅 HAFTA 3-4: BACKEND ALTYAPISI

### Hafta 3 - Core Backend Setup

#### Proje Kurulumu
- [x] Node.js + Express projesi oluşturma
- [x] Package.json yapılandırması
- [x] Prisma ORM kurulumu
- [x] Klasör yapısını oluşturma
  - [x] `/src/controllers`
  - [x] `/src/routes`
  - [x] `/src/middleware`
  - [x] `/src/utils`
  - [x] `/src/config`
  - [x] `/src/services`
- [x] Environment variables (.env)
  - [x] DATABASE_URL
  - [x] JWT_SECRET
  - [x] JWT_EXPIRES_IN
  - [x] CLOUDINARY_URL
  - [x] PORT
  - [x] NODE_ENV
- [x] Logger (Winston) kurulumu
- [x] Error handler middleware
- [x] CORS yapılandırması
- [x] Helmet güvenlik middleware
- [x] Rate limiting middleware

#### Database Schema (Prisma)
- [x] `restaurants` tablosu
  - [x] id, name, slug, email, password_hash
  - [x] phone, address, latitude, longitude
  - [x] location_radius (default 50m)
  - [x] session_timeout (default 30 dakika)
  - [x] logo_url, is_active
  - [x] subscription_plan, subscription_expires_at
  - [x] created_at, updated_at
  - [x] İndeksler: email, slug, location
- [x] `categories` tablosu
  - [x] id, restaurant_id, name, name_en
  - [x] display_order, icon, is_active
  - [x] Unique constraint: restaurant_id + name
- [x] `menu_items` tablosu
  - [x] id, restaurant_id, category_id
  - [x] name, name_en, description, description_en
  - [x] price, image_url
  - [x] is_available, is_featured
  - [x] allergens (array), dietary_info (array)
  - [x] preparation_time, display_order
- [x] `tables` tablosu
  - [x] id, restaurant_id, table_number, table_name
  - [x] qr_code (unique), capacity, is_active
  - [x] Unique constraint: restaurant_id + table_number
- [x] `sessions` tablosu
  - [x] id, restaurant_id, table_id, session_token
  - [x] customer_latitude, customer_longitude
  - [x] device_info (JSON)
  - [x] started_at, expires_at, last_activity_at
  - [x] is_active
- [x] `orders` tablosu
  - [x] id, order_number (unique, format: ORD-YYYYMMDD-XXX)
  - [x] restaurant_id, table_id, session_id, table_number
  - [x] status (enum: pending, confirmed, preparing, ready, completed, cancelled)
  - [x] total_amount, payment_method
  - [x] customer_notes, customer_latitude, customer_longitude
  - [x] Timestamp'ler: confirmed_at, preparing_at, ready_at, completed_at, cancelled_at
  - [x] cancellation_reason
- [x] `order_items` tablosu
  - [x] id, order_id, menu_item_id
  - [x] item_name, quantity, unit_price, subtotal
  - [x] notes
- [x] Migration çalıştırma

#### Authentication API
- [x] POST `/api/v1/auth/register`
  - [x] Email validasyonu
  - [x] Şifre hashleme (bcrypt)
  - [x] Slug oluşturma
  - [x] JWT token döndürme
- [x] POST `/api/v1/auth/login`
  - [x] Email/şifre doğrulama
  - [x] JWT access token oluşturma
  - [x] Refresh token oluşturma
- [x] POST `/api/v1/auth/logout`
  - [x] Token invalidation
- [x] POST `/api/v1/auth/refresh-token`
  - [x] Refresh token ile yeni access token
- [x] POST `/api/v1/auth/forgot-password`
  - [x] Şifre sıfırlama maili gönderme
- [x] POST `/api/v1/auth/reset-password`
  - [x] Token ile şifre sıfırlama
- [x] Auth middleware (JWT verification)

#### Restaurant CRUD API
- [x] GET `/api/v1/restaurant/profile`
- [x] PUT `/api/v1/restaurant/profile`
- [x] PATCH `/api/v1/restaurant/location`
- [x] PATCH `/api/v1/restaurant/settings`
- [x] GET `/api/v1/restaurant/stats`
- [x] GET `/api/v1/restaurant/stats/daily`
- [x] GET `/api/v1/restaurant/stats/weekly`
- [x] GET `/api/v1/restaurant/stats/monthly`

#### Category CRUD API
- [x] GET `/api/v1/categories`
- [x] POST `/api/v1/categories`
- [x] GET `/api/v1/categories/:id`
- [x] PUT `/api/v1/categories/:id`
- [x] DELETE `/api/v1/categories/:id`
- [x] PATCH `/api/v1/categories/reorder`

#### Test Yazımı
- [x] Jest yapılandırması
- [x] Auth endpoint testleri
- [x] Public endpoint testleri
- [ ] Restaurant endpoint testleri
- [ ] Category endpoint testleri


---

### Hafta 4 - API Geliştirme Tamamlama

#### Menu Item CRUD API
- [x] GET `/api/v1/menu-items`
  - [x] Kategori filtresi
  - [x] Sadece aktif filtresi
  - [x] Sıralama (display_order)
- [x] POST `/api/v1/menu-items`
  - [x] Joi validasyonu
  - [x] Allergen/dietary info array
- [x] GET `/api/v1/menu-items/:id`
- [x] PUT `/api/v1/menu-items/:id`
- [x] DELETE `/api/v1/menu-items/:id`
- [x] PATCH `/api/v1/menu-items/:id/toggle-availability`
- [x] PATCH `/api/v1/menu-items/:id/toggle-featured`
- [x] POST `/api/v1/menu-items/:id/image`
  - [x] Multer dosya upload
  - [x] Sharp ile resim optimizasyonu
  - [x] Cloudinary'e yükleme
- [x] DELETE `/api/v1/menu-items/:id/image`
- [x] PATCH `/api/v1/menu-items/reorder`

#### Table CRUD API
- [x] GET `/api/v1/tables`
- [x] POST `/api/v1/tables`
  - [x] QR code oluşturma (uuid + restaurant slug)
- [x] GET `/api/v1/tables/:id`
- [x] PUT `/api/v1/tables/:id`
- [x] DELETE `/api/v1/tables/:id`
- [x] GET `/api/v1/tables/:id/qr`
  - [x] QR kodu resim olarak döndürme
- [x] POST `/api/v1/tables/:id/qr/regenerate`
- [x] GET `/api/v1/tables/:id/active-session`

#### Public Menu API (Müşteri için)
- [x] GET `/api/v1/public/menu/:tableQR`
  - [x] QR koddan masa ve restoran bilgisi
  - [x] Menü kategorileri + ürünler
  - [x] Restoran ayarları (lokasyon, radius)
- [x] GET `/api/v1/public/restaurant/:restaurantSlug`

#### Session Management API
- [x] POST `/api/v1/sessions/start`
  - [x] Lokasyon doğrulama (Haversine formula)
  - [x] Session token oluşturma
  - [x] Expires_at hesaplama
- [x] GET `/api/v1/sessions/:token/verify`
- [x] PATCH `/api/v1/sessions/:token/extend`
  - [x] Aktiviteye göre süre uzatma
- [x] DELETE `/api/v1/sessions/:token`

#### Location Verification
- [x] POST `/api/v1/location/verify`
  - [x] Haversine formula implementasyonu
  - [x] Mesafe hesaplama
  - [x] Radius kontrolü
```javascript
// Haversine Formula Implementasyonu
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Dünya yarıçapı (metre)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // metre
}
```

#### Order API
- [x] POST `/api/v1/orders`
  - [x] Session doğrulama
  - [x] Sipariş numarası oluşturma (ORD-YYYYMMDD-XXX)
  - [x] Order items oluşturma
  - [x] Toplam hesaplama
  - [x] WebSocket event emit (new_order)
- [x] GET `/api/v1/orders`
  - [x] Filtreler: status, date range, table
  - [x] Pagination
- [x] GET `/api/v1/orders/:id`
- [x] PATCH `/api/v1/orders/:id/status`
  - [x] Status geçiş validasyonu
  - [x] Timestamp güncelleme
  - [x] WebSocket event emit (order_status_updated)
- [x] DELETE `/api/v1/orders/:id`
  - [x] İptal nedeni kaydetme
- [x] GET `/api/v1/orders/active`
  - [x] pending, confirmed, preparing, ready
- [x] GET `/api/v1/orders/history`
  - [x] completed, cancelled

#### WebSocket Setup
- [x] Socket.io kurulumu
- [x] Restaurant room'ları
  - [x] `join_restaurant` eventi
  - [x] `leave_restaurant` eventi
- [x] Server → Client eventler
  - [x] `new_order` - Yeni sipariş bildirimi
  - [x] `order_status_updated` - Durum değişikliği
  - [x] `session_expired` - Oturum süresi doldu
  - [x] `menu_updated` - Menü güncellendi
- [x] Authentication (JWT token ile)

**Çıktılar:**
- [x] Tüm API endpoints çalışıyor
- [ ] Postman Collection oluşturuldu
- [ ] API dokümantasyonu (Swagger/OpenAPI)
- [ ] Unit test coverage >80%

---

## 📅 HAFTA 5-6: FRONTEND - MÜŞTERİ ARAYÜZÜ (PWA)

### Hafta 5 - Temel Müşteri Sayfaları

#### Proje Setup
- [x] Next.js 14 projesi oluşturma (App Router)
- [x] Tailwind CSS yapılandırması
- [x] Zustand store kurulumu
- [x] Axios instance oluşturma
- [x] Socket.io client kurulumu
- [x] React Hook Form kurulumu
- [x] Zod validasyon kurulumu

#### Lokasyon İzni ve Doğrulama
- [x] Lokasyon izni modal komponenti
  - [x] İzin isteme butonu
  - [x] İzin açıklama metni
  - [x] İzin red durumu handling
- [x] Geolocation API kullanımı
  - [x] getCurrentPosition()
  - [x] Hata yönetimi (PERMISSION_DENIED, POSITION_UNAVAILABLE)
- [x] Lokasyon doğrulama API çağrısı
- [x] Mesafe hata modalı (>50m)
- [ ] Manuel masa giriş alternatifi

#### Public Menü Sayfası (`/menu/:tableQR`)
- [x] Route oluşturma
- [x] Loading skeleton
- [x] Header komponenti
  - [x] Restoran logosu
  - [x] Restoran adı
  - [x] Session timer (countdown)
- [x] Kategori tab navigasyonu
  - [x] Yatay scroll
  - [x] Aktif kategori highlight
  - [x] Sticky header
- [x] Ürün listesi
  - [x] Kategori bazlı gruplama
  - [ ] Lazy loading (infinite scroll)
  - [ ] Pull-to-refresh
- [x] Ürün kartı komponenti
  - [x] Ürün resmi (lazy load, placeholder)
  - [x] Ürün adı
  - [x] Açıklama (truncated)
  - [x] Fiyat
  - [x] Allergen ikonları
  - [x] Diyet bilgisi badge'leri
  - [x] "Sepete Ekle" butonu (+)
- [x] Ürün detay modal
  - [x] Büyük resim
  - [x] Tam açıklama
  - [x] Allergen listesi
  - [x] Miktar seçici
  - [x] Ürün notu textarea
  - [x] Sepete ekle butonu
- [x] Fixed bottom bar
  - [x] Sepet ikonu + badge
  - [x] Toplam tutar

#### Sepet Sayfası (`/cart`)
- [x] Sepet store (Zustand)
  - [x] addItem action
  - [x] removeItem action
  - [x] updateQuantity action
  - [x] clearCart action
  - [x] Total hesaplama selector
- [x] Sepet UI
  - [x] Header (Geri butonu, "Sepetim")
  - [x] Boş sepet durumu
  - [x] Ürün listesi
    - [x] Ürün adı
    - [x] Miktar (+/- butonları)
    - [x] Birim fiyat
    - [x] Subtotal
    - [x] Silme butonu
    - [x] Ürün notu görüntüleme/düzenleme
  - [x] Sipariş notu textarea
  - [x] Ödeme seçimi
    - [x] Radio: "Nakit"
    - [x] Radio: "Kredi Kartı (Masada)"
  - [x] Toplam tutar (büyük)
  - [x] "Siparişi Gönder" butonu (sticky bottom)
- [x] Sipariş gönderme
  - [x] Form validasyonu
  - [x] API çağrısı
  - [x] Loading state
  - [x] Hata handling
  - [x] Başarı redirect

#### Sipariş Takip Sayfası (`/order/:orderId`)
- [x] Route oluşturma
- [x] Durum göstergesi (stepper)
  - [x] ✓ Sipariş alındı
  - [x] ⏳ Onaylandı
  - [x] ⏳ Hazırlanıyor
  - [x] ⏳ Hazır
  - [x] ⏳ Tamamlandı
- [x] Sipariş detayları
  - [x] Sipariş numarası
  - [x] Masa numarası
  - [x] Sipariş zamanı
  - [x] Ürün listesi
  - [x] Toplam tutar
- [x] Real-time güncelleme (WebSocket)
  - [x] `order_status_updated` dinleme
  - [x] UI güncelleme
- [x] "Yeni Sipariş Ver" butonu

#### WebSocket Entegrasyonu
- [x] Socket context/provider
- [x] Bağlantı yönetimi
- [x] Event listeners
- [x] Reconnection logic
- [x] Session expired handling

---

### Hafta 6 - PWA ve Optimizasyon

#### Session Timer Komponenti
- [x] Countdown timer (MM:SS)
- [x] 5 dakika kala uyarı (kırmızı, yanıp sönen)
- [x] Süre dolunca modal
- [x] Süre uzatma API çağrısı
- [x] LocalStorage ile senkronizasyon

#### PWA Yapılandırması
- [x] `manifest.json`
  - [x] name, short_name
  - [x] theme_color, background_color
  - [x] icons (192x192, 512x512)
  - [x] display: standalone
  - [x] start_url
- [x] `service-worker.js`
  - [x] Cache stratejisi (stale-while-revalidate)
  - [x] Offline fallback sayfası
  - [x] Asset caching
- [x] Next.js PWA plugin kurulumu
- [ ] Add to Home Screen (A2HS) prompt
- [ ] Splash screen tasarımı

#### Responsive Design Optimizasyonu
- [x] Mobile first (375px)
- [x] Tablet breakpoint (768px)
- [x] Touch hedefleri (min 44x44px)
- [ ] Safe area insets (iPhone notch)
- [ ] Landscape mode testing

#### Accessibility (a11y)
- [x] Semantic HTML kullanımı
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus management
- [x] Color contrast (WCAG AA)
- [ ] Screen reader testing

#### Performance Optimizasyonu
- [x] Image optimization (next/image)
- [x] Font optimization
- [x] Code splitting
- [ ] Bundle analyzer
- [ ] Lighthouse audit (hedef: >90)

**Çıktılar:**
- [x] Tam fonksiyonel müşteri arayüzü
- [ ] Lighthouse score >90
- [x] PWA kurulabilir (A2HS)

---

## 📅 HAFTA 7: FRONTEND - ADMİN PANELİ

#### Admin Authentication
- [x] Login sayfası (`/admin/login`)
  - [x] Email input
  - [x] Password input
  - [x] Giriş yap butonu
  - [x] Şifremi unuttum linki
  - [x] Form validasyonu (Zod)
  - [x] Error toast
- [x] Auth store (Zustand)
  - [x] token storage
  - [x] user info
  - [x] login/logout actions
- [x] Protected route middleware
- [x] Token refresh logic
- [x] Logout functionality

#### Dashboard Sayfası (`/admin/dashboard`)
- [x] Layout (Sidebar + Content)
  - [x] Desktop: Fixed sidebar
  - [x] Mobile: Hamburger menu
- [x] Sidebar navigasyonu
  - [x] Dashboard
  - [x] Siparişler
  - [x] Menü
  - [x] Masalar
  - [x] Ayarlar
- [x] Üst bar
  - [x] Restoran adı
  - [x] Bildirim ikonu + badge
  - [x] Profil dropdown
- [x] İstatistik kartları
  - [x] Bugünkü sipariş sayısı
  - [x] Bugünkü toplam gelir
  - [x] Aktif masa sayısı
  - [x] Ortalama sipariş değeri
- [x] Aktif siparişler listesi (real-time)
  - [x] Sipariş kartları
  - [x] Hızlı durum güncelleme
- [ ] Grafikler (opsiyonel)
  - [ ] Saatlik sipariş dağılımı
  - [ ] Popüler ürünler

#### Menü Yönetimi Sayfası (`/admin/menu`)
- [x] Kategori yönetimi
  - [x] Kategori listesi (accordion)
  - [x] Kategori ekleme modal
  - [x] Kategori düzenleme
  - [x] Kategori silme (confirmation)
  - [ ] Drag-drop sıralama
- [x] Ürün yönetimi
  - [x] Ürün listesi (grid/list toggle)
  - [x] Ürün kartı
    - [x] Resim thumbnail
    - [x] İsim
    - [x] Fiyat
    - [x] Aktif/Pasif toggle
    - [x] Düzenle/Sil butonları
  - [x] Ürün ekleme/düzenleme modal
    - [x] Resim upload (tıkla-yükle, backend Cloudinary API)
    - [x] Resim önizleme
    - [x] İsim (TR + EN)
    - [x] Açıklama (TR + EN)
    - [x] Kategori seçimi (dropdown)
    - [x] Fiyat input
    - [ ] Allergenler (multi-select chips)
    - [ ] Diyet bilgisi (multi-select chips)
    - [x] Hazırlama süresi (dakika)
    - [x] Aktif toggle
    - [x] Kaydet/İptal butonları
  - [x] Ürün silme (confirmation)
  - [ ] Drag-drop sıralama (kategoriler arası)
- [ ] Toplu işlemler
  - [ ] Seçili ürünleri pasife al
  - [ ] Seçili ürünleri sil

#### Masa Yönetimi Sayfası (`/admin/tables`)
- [x] Masa listesi (grid view)
  - [x] Masa kartı
    - [x] Masa numarası
    - [x] Masa adı
    - [x] Kapasite
    - [x] QR önizleme
    - [x] Aktif/Pasif badge
    - [x] Aksiyon butonları
- [x] Masa ekleme modal
  - [x] Masa numarası
  - [x] Masa adı (opsiyonel)
  - [x] Kapasite
- [x] Masa düzenleme
- [x] Masa silme (confirmation)
- [x] QR kod işlemleri
  - [x] QR görüntüleme (büyük modal)
  - [x] QR indirme (PNG/SVG)
  - [ ] QR yazdırma (print dialog)
  - [x] QR yenileme (regenerate)
- [ ] Toplu QR indirme (ZIP)

#### Sipariş Yönetimi Sayfası (`/admin/orders`)
- [x] Filtreler
  - [x] Durum (Tümü, Bekleyen, Onaylanan, Hazırlanan, Hazır, Tamamlanan, İptal)
  - [ ] Tarih aralığı (date picker)
  - [x] Masa seçimi
  - [x] Arama (sipariş no)
- [x] Sipariş listesi (tablo)
  - [x] Sipariş no
  - [x] Masa
  - [x] Ürünler (truncated)
  - [x] Tutar
  - [x] Durum badge
  - [x] Zaman (relative)
  - [x] Aksiyonlar
- [x] Sipariş detay modal
  - [x] Sipariş bilgileri
  - [x] Ürün listesi (miktar, not)
  - [x] Müşteri notu
  - [ ] Durum geçmişi
  - [x] Durum güncelleme butonları
- [x] İptal işlemi
  - [x] İptal nedeni (dropdown/textarea)
  - [x] Confirmation
- [x] Pagination
- [x] Real-time güncelleme (WebSocket)

#### Ayarlar Sayfası (`/admin/settings`)
- [x] Tab yapısı
- [x] Genel Bilgiler tab'ı
  - [x] Restoran adı
  - [x] Email (readonly)
  - [x] Telefon
  - [x] Adres
  - [ ] Logo upload
- [x] Lokasyon tab'ı
  - [ ] Harita görüntüleme (Google Maps/Leaflet)
  - [ ] Haritadan konum seçme
  - [x] Enlem/Boylam input
  - [x] Yarıçap slider (10-200m)
  - [ ] Yarıçap görselleştirme (haritada daire)
- [x] Oturum Ayarları tab'ı
  - [x] Oturum süresi (input, dakika)
  - [ ] Uyarı süresi (5 dakika kala)
- [x] Güvenlik tab'ı
  - [x] Şifre değiştirme formu
  - [x] Mevcut şifre
  - [x] Yeni şifre
  - [x] Şifre tekrar
- [ ] Abonelik tab'ı (Faz 2)
  - [ ] Mevcut plan
  - [ ] Kullanım istatistikleri
  - [ ] Plan yükseltme (disabled)
- [x] Kaydet butonu (form bazlı)

#### Responsive Design
- [x] Mobile sidebar (drawer)
- [x] Responsive tablolar
- [x] Touch-friendly inputs
- [x] Tablet optimizasyonu

**Çıktılar:**
- [x] Tam fonksiyonel admin paneli
- [ ] Role-based access control (hazır)


---

## 📅 HAFTA 8: MUTFAK EKRANI + ENTEGRASYONLAR

#### Mutfak Ekranı (`/kitchen`)
- [x] Tam ekran layout (no sidebar)
- [x] Üst bar
  - [x] Restoran logosu
  - [x] Aktif sipariş sayısı
  - [x] Son güncelleme zamanı
  - [x] Ayarlar ikonu (ses açık/kapalı)
- [x] 3 kolon layout (Kanban)
  - [x] Yeni Siparişler (kırmızı çerçeve)
  - [x] Hazırlananlar (sarı çerçeve)
  - [x] Hazırlar (yeşil çerçeve)
- [x] Sipariş kartı komponenti
  - [x] Sipariş numarası (BÜYÜK)
  - [x] Masa numarası
  - [x] Zaman (relative, örn: "5 dk önce")
  - [x] Ürün listesi
    - [x] Ürün adı
    - [x] Miktar (BÜYÜK, bold)
    - [x] Notlar (highlighted)
  - [x] Aksiyon butonları (BÜYÜK, dokunmatik)
    - [x] "HAZIRLANIYOR" (yeni → hazırlanan)
    - [x] "HAZIR" (hazırlanan → hazır)
    - [x] "SERVİS EDİLDİ" (hazır → tamamlanan)
- [x] Real-time güncelleme (WebSocket)
  - [x] `new_order` - Yeni kart ekleme
  - [x] `order_status_updated` - Kart taşıma
- [x] Ses efektleri
  - [x] Yeni sipariş sesi (notification sound)
  - [x] Ses açık/kapalı toggle
  - [x] Browser ses izni handling
- [x] Auto-refresh fallback (her 30 saniye)
- [x] Keyboard shortcuts
  - [x] 1-9: Sipariş seçimi
  - [x] Enter: Durum ilerletme
  - [x] Escape: Seçimi kaldır

#### Entegrasyonlar

##### Cloudinary Resim Servisi
- [x] Cloudinary SDK kurulumu
- [x] Upload preset oluşturma
- [x] Resim yükleme servisi
  - [x] Boyut limiti (max 5MB)
  - [x] Format dönüşümü (webp)
  - [x] Otomatik crop/resize
  - [x] Thumbnail oluşturma
- [x] Resim silme
- [x] CDN URL kullanımı

##### Email Bildirimleri
- [x] Nodemailer + SMTP (Gmail) entegrasyonu
- [x] Email template'leri
  - [x] Hoş geldin emaili
  - [x] Şifre sıfırlama
  - [ ] (Opsiyonel) Günlük rapor
- [x] Email gönderme servisi
- [x] Error handling ve retry

##### WebSocket Tam Entegrasyonu
- [x] Tüm event'lerin test edilmesi
- [x] Connection durumu UI (ConnectionIndicator component)
- [x] Reconnection logic (10 attempts, exponential backoff)
- [x] Heartbeat/ping-pong (25s interval)

#### End-to-End Testing (Cypress)
- [x] Cypress kurulumu
- [x] Test senaryoları
  - [x] Müşteri akışı
    - [x] QR okutma simulasyonu
    - [x] Menü görüntüleme
    - [x] Sepete ekleme
    - [x] Sipariş gönderme
    - [x] Sipariş takibi
  - [x] Admin akışı
    - [x] Login
    - [x] Menü ekleme/düzenleme
    - [x] Masa oluşturma
    - [ ] QR indirme
    - [x] Sipariş onaylama
  - [x] Mutfak akışı
    - [x] Sipariş işleme
    - [x] Durum güncelleme
- [ ] CI/CD entegrasyonu

**Çıktılar:**
- [x] Tüm sistemler entegre
- [x] E2E testler yazılmış (5 test dosyası)
- [x] Cloudinary entegrasyonu çalışıyor (backend + frontend + Railway env vars)
- [x] Email sistemi hazır (Nodemailer + SMTP Gmail)

---

## 📅 HAFTA 9-10: BETA TEST

### Hafta 9 - Pilot Kurulum

#### Production Environment
- [x] Railway projesi oluşturma
- [x] PostgreSQL instance oluşturma
- [x] Environment variables ayarlama
- [ ] Domain bağlama (subdomain)
- [x] SSL sertifikası (otomatik)
- [x] Deployment script (Dockerfile + railway.toml)

#### Pilot Restoran Anlaşması
- [ ] 3 pilot restoran belirleme
- [ ] Pilot program şartları açıklama
- [ ] Anlaşma imzalama
- [ ] İletişim kanalı kurma (WhatsApp grubu)

#### Restoran Kurulumları
- [ ] Restoran 1 kurulumu
  - [ ] Hesap oluşturma
  - [ ] Menü giriş (yardım)
  - [ ] Masa ekleme
  - [ ] QR yazdırma (yardım)
  - [ ] Personel eğitimi (1 saat)
  - [ ] Test siparişi
  - [ ] Canlıya alma
- [ ] Restoran 2 kurulumu
  - [ ] (Aynı adımlar)
- [ ] Restoran 3 kurulumu
  - [ ] (Aynı adımlar)

#### Aktif Destek
- [ ] İlk hafta yoğun destek
- [ ] WhatsApp hızlı yanıt
- [ ] Günlük check-in

---

### Hafta 10 - Geri Bildirim Toplama

#### Bug Tracking
- [ ] Bug raporlama sistemi (GitHub Issues / Notion)
- [ ] Günlük bug kontrolü
- [ ] Kritik bug önceliklendirme
- [ ] Bug fix ve deploy

#### Feedback Toplama
- [ ] Restoran sahibi görüşmeleri (yüz yüze)
- [ ] Garson/mutfak personeli feedback
- [ ] Müşteri gözlemi (restoranda)
- [ ] Kullanım metrikleri analizi
  - [ ] Sipariş sayıları
  - [ ] Ortalama sipariş süresi
  - [ ] Hata oranları

#### Anket
- [ ] Kullanıcı memnuniyeti anketi hazırlama
- [ ] Google Forms oluşturma
- [ ] Pilotlara gönderme
- [ ] Sonuç analizi

#### Önceliklendirme
- [ ] Tüm feedback'leri listeleme
- [ ] Kritiklik skorlaması
- [ ] Effort tahmini
- [ ] Roadmap güncelleme

**Çıktılar:**
- [ ] Beta test raporu
- [ ] Bug listesi (prioritize edilmiş)
- [ ] Feature request listesi
- [ ] NPS skoru

---

## 📅 HAFTA 11-12: İYİLEŞTİRME VE OPTİMİZASYON

### Hafta 11 - Bug Fix ve Performans

#### Kritik Bug Düzeltmeleri
- [ ] Tüm kritik bugları düzelt
- [ ] Regression testing
- [ ] Hotfix deployment

#### Database Optimizasyonu
- [ ] Query analizi (EXPLAIN)
- [ ] Eksik indeksler ekleme
- [ ] N+1 sorguları düzeltme
- [ ] Connection pooling ayarları

#### Frontend Optimizasyonu
- [ ] Code splitting iyileştirme
- [ ] Bundle size analizi
- [ ] Lazy loading iyileştirme
- [ ] React memo/useMemo optimizasyonu
- [ ] Virtual scrolling (büyük listeler)

#### Image Optimizasyonu
- [ ] WebP format kullanımı
- [ ] Responsive images (srcset)
- [ ] Lazy loading images
- [ ] Blur placeholder

#### UI/UX İyileştirmeleri
- [ ] Feedback'e göre UI tweaks
- [ ] Accessibility iyileştirmeleri
- [ ] Loading state iyileştirmeleri
- [ ] Error handling iyileştirmeleri

---

### Hafta 12 - Güvenlik ve Final Test

#### Güvenlik Audit
- [ ] OWASP Top 10 kontrolü
  - [ ] Injection (SQL, NoSQL)
  - [ ] Broken Authentication
  - [ ] Sensitive Data Exposure
  - [ ] XXE
  - [ ] Broken Access Control
  - [ ] Security Misconfiguration
  - [ ] XSS
  - [ ] Insecure Deserialization
  - [ ] Using Components with Known Vulnerabilities
  - [ ] Insufficient Logging & Monitoring
- [ ] Dependency audit (npm audit)
- [ ] Secrets management kontrolü
- [ ] Rate limiting testi
- [ ] Input validation kontrolü
- [ ] HTTPS/SSL kontrolü

#### Load Testing
- [ ] k6 veya Artillery kurulumu
- [ ] Test senaryoları
  - [ ] Normal yük (50 concurrent users)
  - [ ] Peak yük (200 concurrent users)
  - [ ] Stress test (500+ users)
- [ ] Bottleneck tespiti
- [ ] Scaling stratejisi

#### Monitoring Setup
- [ ] Sentry kurulumu
  - [ ] Backend error tracking
  - [ ] Frontend error tracking
  - [ ] Performance monitoring
  - [ ] Alert kuralları
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation

#### Final Testing
- [ ] Full regression testing
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile device testing
- [ ] Network condition testing (3G, offline)

**Çıktılar:**
- [ ] Stabil, optimize edilmiş sistem
- [ ] Security audit raporu
- [ ] Performance benchmarks
- [ ] Monitoring dashboard

---

## 📅 HAFTA 13-14: PRODUCTION LAUNCH

### Hafta 13 - Deployment ve Hazırlık

#### Domain ve SSL
- [ ] Production domain satın alma (qresto.com.tr veya benzeri)
- [ ] DNS ayarları
- [ ] SSL sertifikası kurulumu
- [ ] www redirect

#### Production Deployment
- [ ] Production environment oluşturma
- [ ] Database migration
- [ ] Environment variables güncelleme
- [ ] CDN kurulumu (Cloudflare)
- [ ] Final deployment
- [ ] Smoke testing

#### Backup Stratejisi
- [ ] Günlük database backup
- [ ] Backup retention policy (30 gün)
- [ ] Restore prosedürü dokümantasyonu
- [ ] Disaster recovery planı

#### Monitoring ve Alerting
- [ ] Production Sentry setup
- [ ] Slack/Email alerting
- [ ] On-call rotation (tek kişi için schedule)
- [ ] Incident response prosedürü

#### Landing Page
- [ ] Marketing landing page
  - [ ] Hero section
  - [ ] Özellikler section
  - [ ] Fiyatlandırma section
  - [ ] FAQ section
  - [ ] İletişim formu
- [ ] SEO optimizasyonu
- [ ] Google Analytics kurulumu

#### Dokümantasyon
- [ ] Kullanıcı kılavuzu (PDF)
- [ ] Video tutoriallar
  - [ ] Hesap oluşturma
  - [ ] Menü ekleme
  - [ ] QR yazdırma
  - [ ] Sipariş işleme
- [ ] FAQ sayfası
- [ ] Destek maili/telefon

#### Soft Launch
- [ ] 5-10 yeni restoran ile iletişim
- [ ] Demo sunumları
- [ ] Onboarding
- [ ] İlk ödeme testleri (Starter plan)

---

### Hafta 14 - Public Launch

#### Marketing Materyalleri
- [ ] Sosyal medya görselleri
  - [ ] Instagram feed postları (10 adet)
  - [ ] Story şablonları
  - [ ] Carousel postları
- [ ] Demo video (2 dakika)
  - [ ] Senaryo yazımı
  - [ ] Çekim/screen recording
  - [ ] Düzenleme
  - [ ] YouTube/Vimeo yükleme
- [ ] Print materyaller
  - [ ] Broşür tasarımı
  - [ ] Kartvizit tasarımı
  - [ ] Roll-up banner tasarımı (opsiyonel)
- [ ] Email şablonları
  - [ ] Launch announcement
  - [ ] Follow-up emaili

#### Sosyal Medya
- [ ] Instagram business hesabı
- [ ] Facebook sayfası
- [ ] LinkedIn şirket sayfası
- [ ] İlk postlar

#### Public Launch
- [ ] Launch emaili gönderme
- [ ] Sosyal medya duyurusu
- [ ] Google Ads kampanyası başlatma
- [ ] Facebook/Instagram Ads başlatma

#### Launch Sonrası Destek
- [ ] 7/24 destek modu (ilk hafta)
- [ ] Hızlı bug fix
- [ ] Kullanıcı onboarding desteği
- [ ] Feedback toplama (aktif)

**Çıktılar:**
- [ ] Canlı production sistemi
- [ ] İlk ödeme alan müşteriler
- [ ] Marketing funnel aktif
- [ ] Destek kanalları hazır

---

## 📋 HESAP VE SERVİS KURULUMU

### Hosting & Database
- [x] Railway hesabı oluşturma
- [x] Railway projeleri oluşturma
  - [x] Backend service (qresto-backend)
  - [x] PostgreSQL database
  - [x] Redis
- [x] Connection string alma
- [ ] Backup ayarları

### Dosya Depolama
- [x] Cloudinary hesabı oluşturma
- [x] Upload preset oluşturma
- [x] API credentials alma
- [x] Folder yapısı planlama (`qresto/restaurants/{id}/menu`)

### Domain & SSL
- [ ] Domain seçeneklerini araştırma
  - [ ] qresto.com.tr
  - [ ] qresto.com
  - [ ] siparisimenü.com
- [ ] Domain satın alma (Namecheap/GoDaddy)
- [ ] DNS yönetimi setup
- [ ] Email forwarding (info@domain)

### Monitoring & Analytics
- [ ] Sentry hesabı oluşturma
- [ ] Sentry projesi (backend + frontend)
- [ ] Google Analytics 4 hesabı
- [ ] GA4 property oluşturma
- [ ] UptimeRobot hesabı

### Email Servisi
- [x] Nodemailer (Gmail SMTP) kurulumu
- [x] Gmail App Password oluşturma
- [x] Railway'e SMTP env vars ekleme
- [x] Sender: mahmuthasantaran@gmail.com

### Version Control & CI/CD
- [x] GitHub repository oluşturma
  - [x] Monorepo yapısı (qresto)
- [ ] Branch strategy (main, develop, feature/*)
- [ ] GitHub Actions workflow
  - [ ] Lint on PR
  - [ ] Test on PR
  - [ ] Deploy on merge to main
- [ ] Environment secrets

### Ödeme Sistemi (Faz 2)
- [ ] iyzico/PayTR hesabı (araştırma)
- [ ] Sandbox ortam
- [ ] API dokümantasyonu okuma

---

## 📋 YASAL VE İŞ DOKÜMANLARI

### Yasal Dokümanlar
- [ ] KVKK Aydınlatma Metni
  - [ ] Hangi veriler toplanıyor
  - [ ] Verilerin kullanım amacı
  - [ ] Veri saklama süresi
  - [ ] Kullanıcı hakları
- [ ] Gizlilik Politikası
- [ ] Kullanım Koşulları
  - [ ] Hizmet tanımı
  - [ ] Kullanıcı sorumlulukları
  - [ ] Fikri mülkiyet
  - [ ] Sorumluluk sınırlaması
  - [ ] Fesih koşulları

### İş Dokümanları
- [ ] Satış Sözleşmesi Şablonu
  - [ ] Hizmet kapsamı
  - [ ] Fiyatlandırma
  - [ ] Ödeme koşulları
  - [ ] İptal politikası
- [ ] Pilot Program Şartları
  - [ ] Süre
  - [ ] Beklentiler
  - [ ] Feedback gereksinimleri
  - [ ] Geçiş koşulları
- [ ] Fatura şablonu
- [ ] Teklif şablonu

### Marka & Tasarım
- [ ] Logo tasarımı (final)
- [ ] Marka renkleri (hex codes)
- [ ] Typography guideliner
- [ ] Favicon

---

## 🛠️ TEKNİK BORÇ VE İYİLEŞTİRME BACKLOG

### Kısa Vadeli (İlk 3 ay sonra)
- [ ] Redis cache implementasyonu
- [ ] API rate limiting iyileştirme
- [ ] Logging iyileştirme (structured logs)
- [ ] Error boundary iyileştirmeleri
- [ ] Unit test coverage artırma

### Orta Vadeli (6 ay sonra)
- [ ] Database read replica
- [ ] CDN optimizasyonu
- [ ] API versioning (v2)
- [ ] GraphQL araştırması
- [ ] Microservice potansiyeli değerlendirme

### Uzun Vadeli (12 ay sonra)
- [ ] Multi-tenant architecture
- [ ] Kubernetes migration (scale için)
- [ ] Machine learning integrations
- [ ] Advanced analytics pipeline

---

## 🎯 BAŞARI KRİTERLERİ

### 3 Ay Sonra
- [ ] 10 aktif restoran
- [ ] >1.000 sipariş işlenmiş
- [ ] %95+ sistem uptime
- [ ] NPS >40
- [ ] <10 kritik bug

### 6 Ay Sonra
- [ ] 30 aktif restoran
- [ ] ₺15.000/ay MRR
- [ ] <10% churn rate
- [ ] İlk pozitif nakit akışı
- [ ] Tam otomatik onboarding

### 12 Ay Sonra
- [ ] 100 aktif restoran
- [ ] ₺50.000/ay MRR
- [ ] 2 kişilik takım
- [ ] Seed funding (opsiyonel)
- [ ] Faz 2 özellikleri canlı:
  - [ ] Ödeme entegrasyonu
  - [ ] Detaylı analitik
  - [ ] Sadakat programı

---

## 📊 PROJE DURUMU ÖZETİ

### Tamamlanan
- [x] Backend proje kurulumu (Express 5.x + Prisma + Socket.io)
- [x] Frontend proje kurulumu (Next.js 16 App Router + Zustand + Tailwind 4)
- [x] Temel klasör yapısı
- [x] Package.json bağımlılıkları
- [x] Database schema (8 model, migration'lar hazır)
- [x] Authentication sistemi (JWT + refresh token)
- [x] Tüm API endpoint'leri (9 controller, 9 route)
- [x] Müşteri arayüzü (menü, sepet, sipariş takip)
- [x] Admin paneli (dashboard, menü, masa, sipariş, ayarlar, ikram yönetimi)
- [x] Mutfak ekranı (Kanban, drag-drop, ses bildirimi, klavye kısayolları)
- [x] Socket.io gerçek zamanlı entegrasyon
- [x] PWA desteği (manifest, service worker, offline sayfa)
- [x] Docker yapılandırması (PostgreSQL + Redis + Backend + Frontend)
- [x] Railway deployment (Backend + Frontend + PostgreSQL + Redis canlı)
- [x] Kayıt sayfası (/admin/register)
- [x] Landing page + Demo sayfası
- [x] Cypress E2E testleri (5 test dosyası)
- [x] Jest birim testleri (auth, public)
- [x] WebSocket tam entegrasyon (connection indicator, heartbeat, reconnection)
- [x] İkram (Treat) sistemi (backend + frontend)
- [x] Sipariş takip sayfası (/order/[orderNumber])

### Devam Eden / Eksik
- [x] Şifre sıfırlama frontend sayfası (/admin/forgot-password + /admin/reset-password)\n- [x] Backend şifre sıfırlama token mantığı (resetToken + resetTokenExpiry DB alanları)
- [x] PWA ikonları — manifest var ve public/icons/ dosyaları oluşturuldu
- [x] Cloudinary hesabı + env var'ları — backend + frontend entegre, Railway'de aktif
- [x] Email gönderme servisi (şifre sıfırlama + hoş geldin maili, Nodemailer + Gmail SMTP)
- [ ] Test coverage artırma (>80%)
- [ ] API dokümantasyonu (Swagger/OpenAPI)
- [ ] Custom domain bağlama (örn: app.qresto.com)
- [x] FRONTEND_URL env var'ı Railway'e eklendi

### Başlanmamış (Faz 2)
- [ ] Detaylı analitik dashboard
- [ ] Sadakat programı
- [ ] Çoklu dil desteği
- [ ] Load testing
- [ ] Sentry monitoring
- [ ] Abonelik/ödeme sistemi

---

## 🆕 EK GÖREVLER (Tespit Edilen)

Aşağıdaki görevler kod incelemesi sırasında tespit edilmiş, orijinal planda olmayan ama gerekli olan işlerdir.

### 🔧 Kritik Düzeltmeler
- [x] QR kod URL'lerinde localhost yerine prod URL kullanılması (CORS_ORIGIN fallback eklendi)
- [x] Test endpoint'inde hardcoded localhost düzeltildi
- [x] Copyright yılı 2024 → 2026 güncellendi
- [x] Şifre sıfırlama sayfası oluşturma (`/admin/forgot-password` + `/admin/reset-password`)
- [x] Backend forgot/reset password gerçek token mantığı (DB'de resetToken alanı + 1 saat expiry)
- [x] PWA ikonları oluşturma (8 boyut: 72px → 512px + favicon)
- [x] `FRONTEND_URL` env var'ını Railway backend'e ekleme

### 🖼️ Görsel / Upload Sistemi
- [x] Cloudinary hesabı açma
- [x] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env var ekleme
- [x] Admin panelde menü ürünü resim upload (tıkla-yükle + silme UI)
- [x] Resim upload hata durumu UI

### 📧 Email Sistemi
- [x] Email servis sağlayıcı seçimi → Nodemailer + Gmail SMTP
- [x] Gmail App Password oluşturma + Railway env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- [x] Backend'de email gönderim servisi yazma (`email.service.js`)
- [x] Şifre sıfırlama email şablonu (HTML, branded)
- [x] Hoş geldin email şablonu (HTML, branded)

### 🔒 Güvenlik
- [x] JWT secret'ları daha güçlü rastgele string yapma (128 karakter, crypto.randomBytes)
- [ ] Rate limiting prod ayarları (login endpoint'i için daha sıkı)
- [ ] Input sanitization kontrolü (XSS)
- [ ] Helmet CSP ayarları sıkılaştırma

### 📊 Monitoring & Logging
- [ ] Sentry hesabı oluşturma
- [ ] Backend Sentry entegrasyonu
- [ ] Frontend Sentry entegrasyonu
- [ ] UptimeRobot ile uptime izleme
- [ ] Railway log'larını periyodik kontrol

---

*Son güncelleme: 2026-02-19*

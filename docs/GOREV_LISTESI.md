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
- [ ] Müşteri Arayüzü Wireframe
  - [ ] QR okutma ve lokasyon izni ekranı
  - [ ] Menü listesi sayfası
  - [ ] Ürün detay modal
  - [ ] Sepet sayfası
  - [ ] Sipariş takip sayfası
  - [ ] Oturum süresi uyarı modal
- [ ] Admin Panel Wireframe
  - [ ] Login sayfası
  - [ ] Dashboard sayfası
  - [ ] Menü yönetimi sayfası
  - [ ] Masa yönetimi sayfası
  - [ ] Sipariş listesi sayfası
  - [ ] Ayarlar sayfası
- [ ] Mutfak Ekranı Wireframe
  - [ ] Sipariş kartları görünümü (3 kolon)
  - [ ] Durum geçiş butonları

#### High-Fidelity Mockup (Figma)
- [ ] Design System oluşturma
  - [ ] Renk paleti (Primary, Secondary, Accent, Neutral)
  - [ ] Typography (Font ailesi, boyutları, ağırlıkları)
  - [ ] Spacing sistemi (4px grid)
  - [ ] Border radius değerleri
  - [ ] Shadow değerleri
- [ ] Component Library
  - [ ] Button (Primary, Secondary, Danger, Ghost)
  - [ ] Input (Text, Number, Search, Textarea)
  - [ ] Card (Product, Order, Stat)
  - [ ] Modal (Confirmation, Form, Alert)
  - [ ] Navigation (Tabs, Sidebar, Bottom Bar)
  - [ ] Badge (Status, Count)
  - [ ] Toast (Success, Error, Warning, Info)
- [ ] Responsive tasarımlar
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1280px)

**Çıktılar:**
- [ ] Figma dosyası (tüm ekranlar)
- [ ] Style Guide dokümanı
- [ ] Component Library

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
- [ ] Environment variables (.env)
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRES_IN
  - [ ] CLOUDINARY_URL
  - [ ] PORT
  - [ ] NODE_ENV
- [x] Logger (Winston) kurulumu
- [x] Error handler middleware
- [x] CORS yapılandırması
- [x] Helmet güvenlik middleware
- [x] Rate limiting middleware

#### Database Schema (Prisma)
- [ ] `restaurants` tablosu
  - [ ] id, name, slug, email, password_hash
  - [ ] phone, address, latitude, longitude
  - [ ] location_radius (default 50m)
  - [ ] session_timeout (default 30 dakika)
  - [ ] logo_url, is_active
  - [ ] subscription_plan, subscription_expires_at
  - [ ] created_at, updated_at
  - [ ] İndeksler: email, slug, location
- [ ] `categories` tablosu
  - [ ] id, restaurant_id, name, name_en
  - [ ] display_order, icon, is_active
  - [ ] Unique constraint: restaurant_id + name
- [ ] `menu_items` tablosu
  - [ ] id, restaurant_id, category_id
  - [ ] name, name_en, description, description_en
  - [ ] price, image_url
  - [ ] is_available, is_featured
  - [ ] allergens (array), dietary_info (array)
  - [ ] preparation_time, display_order
- [ ] `tables` tablosu
  - [ ] id, restaurant_id, table_number, table_name
  - [ ] qr_code (unique), capacity, is_active
  - [ ] Unique constraint: restaurant_id + table_number
- [ ] `sessions` tablosu
  - [ ] id, restaurant_id, table_id, session_token
  - [ ] customer_latitude, customer_longitude
  - [ ] device_info (JSON)
  - [ ] started_at, expires_at, last_activity_at
  - [ ] is_active
- [ ] `orders` tablosu
  - [ ] id, order_number (unique, format: ORD-YYYYMMDD-XXX)
  - [ ] restaurant_id, table_id, session_id, table_number
  - [ ] status (enum: pending, confirmed, preparing, ready, completed, cancelled)
  - [ ] total_amount, payment_method
  - [ ] customer_notes, customer_latitude, customer_longitude
  - [ ] Timestamp'ler: confirmed_at, preparing_at, ready_at, completed_at, cancelled_at
  - [ ] cancellation_reason
- [ ] `order_items` tablosu
  - [ ] id, order_id, menu_item_id
  - [ ] item_name, quantity, unit_price, subtotal
  - [ ] notes
- [ ] Migration çalıştırma

#### Authentication API
- [ ] POST `/api/v1/auth/register`
  - [ ] Email validasyonu
  - [ ] Şifre hashleme (bcrypt)
  - [ ] Slug oluşturma
  - [ ] JWT token döndürme
- [ ] POST `/api/v1/auth/login`
  - [ ] Email/şifre doğrulama
  - [ ] JWT access token oluşturma
  - [ ] Refresh token oluşturma
- [ ] POST `/api/v1/auth/logout`
  - [ ] Token invalidation
- [ ] POST `/api/v1/auth/refresh-token`
  - [ ] Refresh token ile yeni access token
- [ ] POST `/api/v1/auth/forgot-password`
  - [ ] Şifre sıfırlama maili gönderme
- [ ] POST `/api/v1/auth/reset-password`
  - [ ] Token ile şifre sıfırlama
- [ ] Auth middleware (JWT verification)

#### Restaurant CRUD API
- [ ] GET `/api/v1/restaurant/profile`
- [ ] PUT `/api/v1/restaurant/profile`
- [ ] PATCH `/api/v1/restaurant/location`
- [ ] PATCH `/api/v1/restaurant/settings`
- [ ] GET `/api/v1/restaurant/stats`
- [ ] GET `/api/v1/restaurant/stats/daily`
- [ ] GET `/api/v1/restaurant/stats/weekly`
- [ ] GET `/api/v1/restaurant/stats/monthly`

#### Category CRUD API
- [ ] GET `/api/v1/categories`
- [ ] POST `/api/v1/categories`
- [ ] GET `/api/v1/categories/:id`
- [ ] PUT `/api/v1/categories/:id`
- [ ] DELETE `/api/v1/categories/:id`
- [ ] PATCH `/api/v1/categories/reorder`

#### Test Yazımı
- [ ] Jest yapılandırması
- [ ] Auth endpoint testleri
- [ ] Restaurant endpoint testleri
- [ ] Category endpoint testleri

---

### Hafta 4 - API Geliştirme Tamamlama

#### Menu Item CRUD API
- [ ] GET `/api/v1/menu-items`
  - [ ] Kategori filtresi
  - [ ] Sadece aktif filtresi
  - [ ] Sıralama (display_order)
- [ ] POST `/api/v1/menu-items`
  - [ ] Joi validasyonu
  - [ ] Allergen/dietary info array
- [ ] GET `/api/v1/menu-items/:id`
- [ ] PUT `/api/v1/menu-items/:id`
- [ ] DELETE `/api/v1/menu-items/:id`
- [ ] PATCH `/api/v1/menu-items/:id/toggle-availability`
- [ ] PATCH `/api/v1/menu-items/:id/toggle-featured`
- [ ] POST `/api/v1/menu-items/:id/image`
  - [ ] Multer dosya upload
  - [ ] Sharp ile resim optimizasyonu
  - [ ] Cloudinary'e yükleme
- [ ] DELETE `/api/v1/menu-items/:id/image`
- [ ] PATCH `/api/v1/menu-items/reorder`

#### Table CRUD API
- [ ] GET `/api/v1/tables`
- [ ] POST `/api/v1/tables`
  - [ ] QR code oluşturma (uuid + restaurant slug)
- [ ] GET `/api/v1/tables/:id`
- [ ] PUT `/api/v1/tables/:id`
- [ ] DELETE `/api/v1/tables/:id`
- [ ] GET `/api/v1/tables/:id/qr`
  - [ ] QR kodu resim olarak döndürme
- [ ] POST `/api/v1/tables/:id/qr/regenerate`
- [ ] GET `/api/v1/tables/:id/active-session`

#### Public Menu API (Müşteri için)
- [ ] GET `/api/v1/public/menu/:tableQR`
  - [ ] QR koddan masa ve restoran bilgisi
  - [ ] Menü kategorileri + ürünler
  - [ ] Restoran ayarları (lokasyon, radius)
- [ ] GET `/api/v1/public/restaurant/:restaurantSlug`

#### Session Management API
- [ ] POST `/api/v1/sessions/start`
  - [ ] Lokasyon doğrulama (Haversine formula)
  - [ ] Session token oluşturma
  - [ ] Expires_at hesaplama
- [ ] GET `/api/v1/sessions/:token/verify`
- [ ] PATCH `/api/v1/sessions/:token/extend`
  - [ ] Aktiviteye göre süre uzatma
- [ ] DELETE `/api/v1/sessions/:token`

#### Location Verification
- [ ] POST `/api/v1/location/verify`
  - [ ] Haversine formula implementasyonu
  - [ ] Mesafe hesaplama
  - [ ] Radius kontrolü
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
- [ ] POST `/api/v1/orders`
  - [ ] Session doğrulama
  - [ ] Sipariş numarası oluşturma (ORD-YYYYMMDD-XXX)
  - [ ] Order items oluşturma
  - [ ] Toplam hesaplama
  - [ ] WebSocket event emit (new_order)
- [ ] GET `/api/v1/orders`
  - [ ] Filtreler: status, date range, table
  - [ ] Pagination
- [ ] GET `/api/v1/orders/:id`
- [ ] PATCH `/api/v1/orders/:id/status`
  - [ ] Status geçiş validasyonu
  - [ ] Timestamp güncelleme
  - [ ] WebSocket event emit (order_status_updated)
- [ ] DELETE `/api/v1/orders/:id`
  - [ ] İptal nedeni kaydetme
- [ ] GET `/api/v1/orders/active`
  - [ ] pending, confirmed, preparing, ready
- [ ] GET `/api/v1/orders/history`
  - [ ] completed, cancelled

#### WebSocket Setup
- [ ] Socket.io kurulumu
- [ ] Restaurant room'ları
  - [ ] `join_restaurant` eventi
  - [ ] `leave_restaurant` eventi
- [ ] Server → Client eventler
  - [ ] `new_order` - Yeni sipariş bildirimi
  - [ ] `order_status_updated` - Durum değişikliği
  - [ ] `session_expired` - Oturum süresi doldu
  - [ ] `menu_updated` - Menü güncellendi
- [ ] Authentication (JWT token ile)

**Çıktılar:**
- [ ] Tüm API endpoints çalışıyor
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
- [ ] Lokasyon izni modal komponenti
  - [ ] İzin isteme butonu
  - [ ] İzin açıklama metni
  - [ ] İzin red durumu handling
- [ ] Geolocation API kullanımı
  - [ ] getCurrentPosition()
  - [ ] Hata yönetimi (PERMISSION_DENIED, POSITION_UNAVAILABLE)
- [ ] Lokasyon doğrulama API çağrısı
- [ ] Mesafe hata modalı (>50m)
- [ ] Manuel masa giriş alternatifi

#### Public Menü Sayfası (`/menu/:tableQR`)
- [ ] Route oluşturma
- [ ] Loading skeleton
- [ ] Header komponenti
  - [ ] Restoran logosu
  - [ ] Restoran adı
  - [ ] Session timer (countdown)
- [ ] Kategori tab navigasyonu
  - [ ] Yatay scroll
  - [ ] Aktif kategori highlight
  - [ ] Sticky header
- [ ] Ürün listesi
  - [ ] Kategori bazlı gruplama
  - [ ] Lazy loading (infinite scroll)
  - [ ] Pull-to-refresh
- [ ] Ürün kartı komponenti
  - [ ] Ürün resmi (lazy load, placeholder)
  - [ ] Ürün adı
  - [ ] Açıklama (truncated)
  - [ ] Fiyat
  - [ ] Allergen ikonları
  - [ ] Diyet bilgisi badge'leri
  - [ ] "Sepete Ekle" butonu (+)
- [ ] Ürün detay modal
  - [ ] Büyük resim
  - [ ] Tam açıklama
  - [ ] Allergen listesi
  - [ ] Miktar seçici
  - [ ] Ürün notu textarea
  - [ ] Sepete ekle butonu
- [ ] Fixed bottom bar
  - [ ] Sepet ikonu + badge
  - [ ] Toplam tutar

#### Sepet Sayfası (`/cart`)
- [ ] Sepet store (Zustand)
  - [ ] addItem action
  - [ ] removeItem action
  - [ ] updateQuantity action
  - [ ] clearCart action
  - [ ] Total hesaplama selector
- [ ] Sepet UI
  - [ ] Header (Geri butonu, "Sepetim")
  - [ ] Boş sepet durumu
  - [ ] Ürün listesi
    - [ ] Ürün adı
    - [ ] Miktar (+/- butonları)
    - [ ] Birim fiyat
    - [ ] Subtotal
    - [ ] Silme butonu
    - [ ] Ürün notu görüntüleme/düzenleme
  - [ ] Sipariş notu textarea
  - [ ] Ödeme seçimi
    - [ ] Radio: "Nakit"
    - [ ] Radio: "Kredi Kartı (Masada)"
  - [ ] Toplam tutar (büyük)
  - [ ] "Siparişi Gönder" butonu (sticky bottom)
- [ ] Sipariş gönderme
  - [ ] Form validasyonu
  - [ ] API çağrısı
  - [ ] Loading state
  - [ ] Hata handling
  - [ ] Başarı redirect

#### Sipariş Takip Sayfası (`/order/:orderId`)
- [ ] Route oluşturma
- [ ] Durum göstergesi (stepper)
  - [ ] ✓ Sipariş alındı
  - [ ] ⏳ Onaylandı
  - [ ] ⏳ Hazırlanıyor
  - [ ] ⏳ Hazır
  - [ ] ⏳ Tamamlandı
- [ ] Sipariş detayları
  - [ ] Sipariş numarası
  - [ ] Masa numarası
  - [ ] Sipariş zamanı
  - [ ] Ürün listesi
  - [ ] Toplam tutar
- [ ] Real-time güncelleme (WebSocket)
  - [ ] `order_status_updated` dinleme
  - [ ] UI güncelleme
- [ ] "Yeni Sipariş Ver" butonu

#### WebSocket Entegrasyonu
- [ ] Socket context/provider
- [ ] Bağlantı yönetimi
- [ ] Event listeners
- [ ] Reconnection logic
- [ ] Session expired handling

---

### Hafta 6 - PWA ve Optimizasyon

#### Session Timer Komponenti
- [ ] Countdown timer (MM:SS)
- [ ] 5 dakika kala uyarı (kırmızı, yanıp sönen)
- [ ] Süre dolunca modal
- [ ] Süre uzatma API çağrısı
- [ ] LocalStorage ile senkronizasyon

#### PWA Yapılandırması
- [ ] `manifest.json`
  - [ ] name, short_name
  - [ ] theme_color, background_color
  - [ ] icons (192x192, 512x512)
  - [ ] display: standalone
  - [ ] start_url
- [ ] `service-worker.js`
  - [ ] Cache stratejisi (stale-while-revalidate)
  - [ ] Offline fallback sayfası
  - [ ] Asset caching
- [ ] Next.js PWA plugin kurulumu
- [ ] Add to Home Screen (A2HS) prompt
- [ ] Splash screen tasarımı

#### Responsive Design Optimizasyonu
- [ ] Mobile first (375px)
- [ ] Tablet breakpoint (768px)
- [ ] Touch hedefleri (min 44x44px)
- [ ] Safe area insets (iPhone notch)
- [ ] Landscape mode testing

#### Accessibility (a11y)
- [ ] Semantic HTML kullanımı
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader testing

#### Performance Optimizasyonu
- [ ] Image optimization (next/image)
- [ ] Font optimization
- [ ] Code splitting
- [ ] Bundle analyzer
- [ ] Lighthouse audit (hedef: >90)

**Çıktılar:**
- [ ] Tam fonksiyonel müşteri arayüzü
- [ ] Lighthouse score >90
- [ ] PWA kurulabilir (A2HS)

---

## 📅 HAFTA 7: FRONTEND - ADMİN PANELİ

#### Admin Authentication
- [ ] Login sayfası (`/admin/login`)
  - [ ] Email input
  - [ ] Password input
  - [ ] Giriş yap butonu
  - [ ] Şifremi unuttum linki
  - [ ] Form validasyonu (Zod)
  - [ ] Error toast
- [ ] Auth store (Zustand)
  - [ ] token storage
  - [ ] user info
  - [ ] login/logout actions
- [ ] Protected route middleware
- [ ] Token refresh logic
- [ ] Logout functionality

#### Dashboard Sayfası (`/admin/dashboard`)
- [ ] Layout (Sidebar + Content)
  - [ ] Desktop: Fixed sidebar
  - [ ] Mobile: Hamburger menu
- [ ] Sidebar navigasyonu
  - [ ] Dashboard
  - [ ] Siparişler
  - [ ] Menü
  - [ ] Masalar
  - [ ] Raporlar
  - [ ] Ayarlar
- [ ] Üst bar
  - [ ] Restoran adı
  - [ ] Bildirim ikonu + badge
  - [ ] Profil dropdown
- [ ] İstatistik kartları
  - [ ] Bugünkü sipariş sayısı
  - [ ] Bugünkü toplam gelir
  - [ ] Aktif masa sayısı
  - [ ] Ortalama sipariş değeri
- [ ] Aktif siparişler listesi (real-time)
  - [ ] Sipariş kartları
  - [ ] Hızlı durum güncelleme
- [ ] Grafikler (opsiyonel)
  - [ ] Saatlik sipariş dağılımı
  - [ ] Popüler ürünler

#### Menü Yönetimi Sayfası (`/admin/menu`)
- [ ] Kategori yönetimi
  - [ ] Kategori listesi (accordion)
  - [ ] Kategori ekleme modal
  - [ ] Kategori düzenleme
  - [ ] Kategori silme (confirmation)
  - [ ] Drag-drop sıralama
- [ ] Ürün yönetimi
  - [ ] Ürün listesi (grid/list toggle)
  - [ ] Ürün kartı
    - [ ] Resim thumbnail
    - [ ] İsim
    - [ ] Fiyat
    - [ ] Aktif/Pasif toggle
    - [ ] Düzenle/Sil butonları
  - [ ] Ürün ekleme/düzenleme modal
    - [ ] Resim upload (react-dropzone)
    - [ ] Resim önizleme
    - [ ] İsim (TR + EN)
    - [ ] Açıklama (TR + EN)
    - [ ] Kategori seçimi (dropdown)
    - [ ] Fiyat input
    - [ ] Allergenler (multi-select chips)
    - [ ] Diyet bilgisi (multi-select chips)
    - [ ] Hazırlama süresi (dakika)
    - [ ] Aktif toggle
    - [ ] Kaydet/İptal butonları
  - [ ] Ürün silme (confirmation)
  - [ ] Drag-drop sıralama (kategoriler arası)
- [ ] Toplu işlemler
  - [ ] Seçili ürünleri pasife al
  - [ ] Seçili ürünleri sil

#### Masa Yönetimi Sayfası (`/admin/tables`)
- [ ] Masa listesi (grid view)
  - [ ] Masa kartı
    - [ ] Masa numarası
    - [ ] Masa adı
    - [ ] Kapasite
    - [ ] QR önizleme
    - [ ] Aktif/Pasif badge
    - [ ] Aksiyon butonları
- [ ] Masa ekleme modal
  - [ ] Masa numarası
  - [ ] Masa adı (opsiyonel)
  - [ ] Kapasite
- [ ] Masa düzenleme
- [ ] Masa silme (confirmation)
- [ ] QR kod işlemleri
  - [ ] QR görüntüleme (büyük modal)
  - [ ] QR indirme (PNG/SVG)
  - [ ] QR yazdırma (print dialog)
  - [ ] QR yenileme (regenerate)
- [ ] Toplu QR indirme (ZIP)

#### Sipariş Yönetimi Sayfası (`/admin/orders`)
- [ ] Filtreler
  - [ ] Durum (Tümü, Bekleyen, Onaylanan, Hazırlanan, Hazır, Tamamlanan, İptal)
  - [ ] Tarih aralığı (date picker)
  - [ ] Masa seçimi
  - [ ] Arama (sipariş no)
- [ ] Sipariş listesi (tablo)
  - [ ] Sipariş no
  - [ ] Masa
  - [ ] Ürünler (truncated)
  - [ ] Tutar
  - [ ] Durum badge
  - [ ] Zaman (relative)
  - [ ] Aksiyonlar
- [ ] Sipariş detay modal
  - [ ] Sipariş bilgileri
  - [ ] Ürün listesi (miktar, not)
  - [ ] Müşteri notu
  - [ ] Durum geçmişi
  - [ ] Durum güncelleme butonları
- [ ] İptal işlemi
  - [ ] İptal nedeni (dropdown/textarea)
  - [ ] Confirmation
- [ ] Pagination
- [ ] Real-time güncelleme (WebSocket)

#### Ayarlar Sayfası (`/admin/settings`)
- [ ] Tab yapısı
- [ ] Genel Bilgiler tab'ı
  - [ ] Restoran adı
  - [ ] Email (readonly)
  - [ ] Telefon
  - [ ] Adres
  - [ ] Logo upload
- [ ] Lokasyon tab'ı
  - [ ] Harita görüntüleme (Google Maps/Leaflet)
  - [ ] Haritadan konum seçme
  - [ ] Enlem/Boylam input
  - [ ] Yarıçap slider (10-200m)
  - [ ] Yarıçap görselleştirme (haritada daire)
- [ ] Oturum Ayarları tab'ı
  - [ ] Oturum süresi (input, dakika)
  - [ ] Uyarı süresi (5 dakika kala)
- [ ] Güvenlik tab'ı
  - [ ] Şifre değiştirme formu
  - [ ] Mevcut şifre
  - [ ] Yeni şifre
  - [ ] Şifre tekrar
- [ ] Abonelik tab'ı (Faz 2)
  - [ ] Mevcut plan
  - [ ] Kullanım istatistikleri
  - [ ] Plan yükseltme (disabled)
- [ ] Kaydet butonu (form bazlı)

#### Responsive Design
- [ ] Mobile sidebar (drawer)
- [ ] Responsive tablolar
- [ ] Touch-friendly inputs
- [ ] Tablet optimizasyonu

**Çıktılar:**
- [ ] Tam fonksiyonel admin paneli
- [ ] Role-based access control (hazır)

---

## 📅 HAFTA 8: MUTFAK EKRANI + ENTEGRASYONLAR

#### Mutfak Ekranı (`/kitchen`)
- [ ] Tam ekran layout (no sidebar)
- [ ] Üst bar
  - [ ] Restoran logosu
  - [ ] Aktif sipariş sayısı
  - [ ] Son güncelleme zamanı
  - [ ] Ayarlar ikonu (ses açık/kapalı)
- [ ] 3 kolon layout (Kanban)
  - [ ] Yeni Siparişler (kırmızı çerçeve)
  - [ ] Hazırlananlar (sarı çerçeve)
  - [ ] Hazırlar (yeşil çerçeve)
- [ ] Sipariş kartı komponenti
  - [ ] Sipariş numarası (BÜYÜK)
  - [ ] Masa numarası
  - [ ] Zaman (relative, örn: "5 dk önce")
  - [ ] Ürün listesi
    - [ ] Ürün adı
    - [ ] Miktar (BÜYÜK, bold)
    - [ ] Notlar (highlighted)
  - [ ] Aksiyon butonları (BÜYÜK, dokunmatik)
    - [ ] "HAZIRLANIYOR" (yeni → hazırlanan)
    - [ ] "HAZIR" (hazırlanan → hazır)
    - [ ] "SERVİS EDİLDİ" (hazır → tamamlanan)
- [ ] Real-time güncelleme (WebSocket)
  - [ ] `new_order` - Yeni kart ekleme
  - [ ] `order_status_updated` - Kart taşıma
- [ ] Ses efektleri
  - [ ] Yeni sipariş sesi (notification sound)
  - [ ] Ses açık/kapalı toggle
  - [ ] Browser ses izni handling
- [ ] Auto-refresh fallback (her 30 saniye)
- [ ] Keyboard shortcuts
  - [ ] 1-9: Sipariş seçimi
  - [ ] Enter: Durum ilerletme
  - [ ] Escape: Seçimi kaldır

#### Entegrasyonlar

##### Cloudinary Resim Servisi
- [ ] Cloudinary SDK kurulumu
- [ ] Upload preset oluşturma
- [ ] Resim yükleme servisi
  - [ ] Boyut limiti (max 5MB)
  - [ ] Format dönüşümü (webp)
  - [ ] Otomatik crop/resize
  - [ ] Thumbnail oluşturma
- [ ] Resim silme
- [ ] CDN URL kullanımı

##### Email Bildirimleri
- [ ] SendGrid/Mailgun hesabı
- [ ] Email template'leri
  - [ ] Hoş geldin emaili
  - [ ] Şifre sıfırlama
  - [ ] (Opsiyonel) Günlük rapor
- [ ] Email gönderme servisi
- [ ] Error handling ve retry

##### WebSocket Tam Entegrasyonu
- [ ] Tüm event'lerin test edilmesi
- [ ] Connection durumu UI
- [ ] Reconnection logic
- [ ] Heartbeat/ping-pong

#### End-to-End Testing (Cypress)
- [ ] Cypress kurulumu
- [ ] Test senaryoları
  - [ ] Müşteri akışı
    - [ ] QR okutma simulasyonu
    - [ ] Menü görüntüleme
    - [ ] Sepete ekleme
    - [ ] Sipariş gönderme
    - [ ] Sipariş takibi
  - [ ] Admin akışı
    - [ ] Login
    - [ ] Menü ekleme/düzenleme
    - [ ] Masa oluşturma
    - [ ] QR indirme
    - [ ] Sipariş onaylama
  - [ ] Mutfak akışı
    - [ ] Sipariş işleme
    - [ ] Durum güncelleme
- [ ] CI/CD entegrasyonu

**Çıktılar:**
- [ ] Tüm sistemler entegre
- [ ] E2E testler yazılmış
- [ ] Cloudinary entegrasyonu çalışıyor
- [ ] Email sistemi hazır

---

## 📅 HAFTA 9-10: BETA TEST

### Hafta 9 - Pilot Kurulum

#### Production Environment
- [ ] Railway projesi oluşturma
- [ ] PostgreSQL instance oluşturma
- [ ] Environment variables ayarlama
- [ ] Domain bağlama (subdomain)
- [ ] SSL sertifikası (otomatik)
- [ ] Deployment script

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
- [ ] Railway hesabı oluşturma
- [ ] Railway projeleri oluşturma
  - [ ] Backend service
  - [ ] PostgreSQL database
  - [ ] Redis (opsiyonel - ileride)
- [ ] Connection string alma
- [ ] Backup ayarları

### Dosya Depolama
- [ ] Cloudinary hesabı oluşturma
- [ ] Upload preset oluşturma
- [ ] API credentials alma
- [ ] Folder yapısı planlama

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
- [ ] SendGrid veya Mailgun hesabı
- [ ] Domain verification
- [ ] API key oluşturma
- [ ] Sender authentication

### Version Control & CI/CD
- [ ] GitHub repository oluşturma
  - [ ] qresto-backend
  - [ ] qresto-frontend
  - [ ] (veya monorepo)
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
- [x] Backend proje kurulumu
- [x] Frontend proje kurulumu (Next.js)
- [x] Temel klasör yapısı
- [x] Package.json bağımlılıkları

### Devam Eden
- [/] Prisma schema (tanımlanacak)
- [/] API endpoint'leri (temel yapı var)

### Başlanmamış
- [ ] Database migration
- [ ] Authentication sistemi
- [ ] Müşteri arayüzü
- [ ] Admin paneli
- [ ] Mutfak ekranı
- [ ] Testler
- [ ] Beta test
- [ ] Production deployment

---

*Son güncelleme: 2026-02-08*

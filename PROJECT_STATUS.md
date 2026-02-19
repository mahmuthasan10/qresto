# 📊 QResto - Proje Durumu ve Yol Haritası

## �️ Kullanılan Teknolojiler

Proje, performans, ölçeklenebilirlik ve kullanıcı deneyimini en üst düzeye çıkarmak için modern teknolojilerle geliştirilmiştir:

### **Frontend (Müşteri & Yönetim Arayüzü)**
*   **Framework:** **Next.js 16** (App Router mimarisi ile güncel React özellikleri).
*   **Dil:** **TypeScript** (Tip güvenliği ve kod kalitesi için).
*   **Stil:** **Tailwind CSS 4** (Hızlı ve modern UI tasarımı).
*   **Durum Yönetimi (State):** **Zustand** (Hafif ve performanslı).
*   **Form Yönetimi:** **React Hook Form + Zod** (Validasyonlu ve optimize formlar).
*   **Gerçek Zamanlı İletişim:** **Socket.io Client** (Anlık sipariş bildirimleri).
*   **PWA:** Mobil uygulama deneyimi ve çevrimdışı çalışma desteği.
*   **UI Bileşenleri:** `lucide-react` (ikonlar), `react-hot-toast` (bildirimler).

### **Backend (API Sunucusu)**
*   **Platform:** **Node.js** + **Express.js**.
*   **Veritabanı:** **PostgreSQL** (Güvenilir ilişkisel veritabanı).
*   **ORM:** **Prisma** (Veritabanı yönetimi ve tip güvenli sorgular).
*   **Gerçek Zamanlı İletişim:** **Socket.io** (Mutfak ve müşteriler arası veri akışı).
*   **Dosya Depolama:** **Cloudinary** (Menü görsellerinin optimizasyonu ve barındırılması).
*   **Güvenlik:**
    *   **JWT:** Kimlik doğrulama.
    *   **Bcrypt:** Şifreleme.
    *   **Helmet & CORS:** HTTP başlık ve erişim güvenliği.
    *   **Rate Limiting:** İstek sınırlama.

### **Test & DevOps**
*   **E2E Test:** **Cypress** (Kullanıcı senaryolarının uçtan uca testi).
*   **Birim Test:** **Jest** (Backend fonksiyonlarının testi).
*   **Versiyon Kontrol:** **Git & GitHub**.
*   **Docker:** Konteynerizasyon (Geliştirme ortamı için).

---

## 🗄️ Veritabanı Şeması (Detaylı)

Proje veritabanı, restoranların menülerini, masalarını, siparişlerini ve müşteri oturumlarını yönetmek için ilişkisel bir yapıdadır.

### 1. 🏢 Restaurants (Restoranlar)
Restoranların temel bilgilerinin tutulduğu ana tablodur.
*   **id:** Benzersiz kimlik (Int)
*   **name:** Restoran adı
*   **slug:** URL dostu restoran adı (benzersiz)
*   **email:** Yönetici giriş e-postası (benzersiz)
*   **passwordHash:** Şifrelenmiş parola
*   **location:** Enlem (`latitude`) ve Boylam (`longitude`) bilgileri. Coğrafi sınırlama için kullanılır.
*   **locationRadius:** Müşterinin sipariş verebilmesi için restorana olan maksimum uzaklığı (metre cinsinden, varsayılan 50m).
*   **sessionTimeout:** Masa oturumunun aktif kalacağı süre (dakika cinsinden, varsayılan 30dk).
*   **İlişkiler:**
    *   `Categories`: Restorana ait kategoriler.
    *   `MenuItems`: Restorana ait menü ürünleri.
    *   `Tables`: Restorana ait masalar.
    *   `Orders`: Restorana gelen siparişler.

### 2. 📂 Categories (Kategoriler)
Menü ürünlerinin gruplandığı tablodur (Örn: Başlangıçlar, Ana Yemekler).
*   **id:** Benzersiz kimlik
*   **restaurantId:** Bağlı olduğu restoran
*   **name:** Kategori adı (Örn: "İçecekler")
*   **displayOrder:** Menüdeki gösterim sırası
*   **isActive:** Kategorinin aktiflik durumu

### 3. 🍔 MenuItems (Menü Ürünleri)
Satışı yapılan ürünlerin detayları.
*   **id:** Benzersiz kimlik
*   **restaurantId & categoryId:** Bağlı olduğu restoran ve kategori
*   **name & description:** Ürün adı ve açıklaması (Çoklu dil desteği için `en` alanları mevcut)
*   **price:** Ürün fiyatı
*   **imageUrl:** Ürün görseli (Cloudinary URL)
*   **isAvailable:** Stok durumu
*   **allergens & dietaryInfo:** Alerjen ve diyet bilgileri (Dizi olarak tutulur)
*   **preparationTime:** Tahmini hazırlanma süresi (dakika)

### 4. 🪑 Tables (Masalar)
Restorandaki fiziksel masaları temsil eder. QR kodlar bu tablolara bağlıdır.
*   **id:** Benzersiz kimlik
*   **tableNumber:** Masa numarası (Örn: "A1", "Bahçe-2")
*   **qrCode:** Masaya özel benzersiz QR kod verisi
*   **capacity:** Masa kapasitesi
*   **İlişkiler:**
    *   `Sessions`: Bu masada açılan oturumlar.
    *   `Orders`: Bu masadan verilen siparişler.
    *   `Treats`: Masalar arası ikram gönderimi (Gönderen/Alan).

### 5. 📱 Sessions (Oturumlar)
Müşterinin QR kodu okuttuğu andan itibaren başlayan aktif kullanım süreci.
*   **id:** Benzersiz kimlik
*   **sessionToken:** Müşteri tarayıcısında saklanan benzersiz anahtar
*   **tableId:** Oturumun açıldığı masa
*   **deviceInfo:** Müşteri cihaz bilgisi (Analiz için)
*   **expiresAt:** Oturumun sona ereceği zaman
*   **isActive:** Oturumun hala geçerli olup olmadığı

### 6. 📝 Orders (Siparişler)
Müşteriler tarafından verilen siparişlerin ana kaydı.
*   **id & orderNumber:** Benzersiz sipariş no (Format: ORD-20240211-001)
*   **status:** Sipariş durumu (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`)
*   **totalAmount:** Toplam sepet tutarı
*   **paymentMethod:** Ödeme tercihi (Nakit / Kredi Kartı)
*   **Timestamp'ler:** `confirmedAt`, `preparingAt` vb. ile siparişin her aşamasının ne zaman gerçekleştiği tutulur.
*   **İlişkiler:**
    *   `OrderItems`: Siparişin içindeki ürünler.

### 7. 🧾 OrderItems (Sipariş Kalemleri)
Bir siparişin içindeki her bir ürünü temsil eder.
*   **orderId:** Bağlı olduğu sipariş
*   **menuItemId:** Sipariş edilen ürün
*   **quantity:** Adet
*   **notes:** Müşterinin ürüne özel notu (Örn: "Soğansız olsun")

---

## 🚀 Yapılacaklar Listesi (Roadmap)

Şu an **8. Hafta** içerisindeyiz. Önümüzdeki süreç aşağıdaki gibidir:

### ✅ 1. Kısa Vadeli Hedefler (8. Hafta - Tamamlanmak Üzere)
Bu hafta sistemin eksik parçaları tamamlanıyor ve test ediliyor.

*   [ ] **Mutfak Ekranı (KDS) Hata Çözümü:**
    *   "İkram" kabul edildiğinde mutfak ekranına düşmemesi sorununun giderilmesi.
*   [ ] **Self-Servis Sipariş Akışı:**
    *   Ödeme yöntemi seçimi ve sipariş tamamlama ekranındaki son hataların düzeltilmesi.
*   [ ] **PWA Optimizasyonları:**
    *   `manifest.json` ve `service-worker` yapılandırmasının son kontrolü (Offline çalışma yeteneği).
*   [ ] **Otomatik Testler:**
    *   Cypress ile yazılan E2E testlerin (Sipariş verme -> Mutfaktan onaylama akışı) başarıyla çalıştırılması.

### 🧪 2. Beta Testi ve Pilot Kurulum (9-10. Hafta)
Sistemi gerçek bir ortamda denemeye başlıyoruz.

#### 9. Hafta: Pilot Kurulum
*   [x] **Production Ortamı Hazırlığı:**
    *   Railway'de canlı veritabanı (PostgreSQL), Redis, Backend ve Frontend servisleri kuruldu.
    *   Backend: `https://qresto-backend-production.up.railway.app`
    *   Frontend: `https://qresto-frontend-production.up.railway.app`
    *   Domain yönlendirmesi henüz yapılmadı (örn: `app.qresto.com`).
*   [ ] **Pilot Restoran Seçimi:**
    *   Sistemi deneyecek 1-2 pilot restoranın veya test ortamının belirlenmesi.
*   [ ] **Veri Girişi:**
    *   Pilot restoranın gerçek menüsünün sisteme girilmesi.
    *   QR kodların basılıp masalara (veya test masalarına) yerleştirilmesi.

#### 10. Hafta: Geri Bildirim ve İzleme
*   [ ] **Bug Avı:**
    *   Gerçek kullanımda ortaya çıkan hataların (bug) loglanması ve çözülmesi.
*   [ ] **Performans İzleme:**
    *   Sunucu yanıt sürelerinin ve veritabanı sorgularının analizi.
*   [ ] **Kullanıcı Geri Bildirimi:**
    *   Garson ve mutfak personelinden kullanım zorlukları hakkında geri bildirim alınması.

### ✨ 3. İyileştirme ve Canlıya Geçiş (11-12. Hafta)
*   [ ] **Optimizasyon:** Kod tekrarı olan yerlerin düzeltilmesi ve performans iyileştirmeleri.
*   [ ] **Güvenlik Testleri:** Yetkisiz erişim denemeleri ve güvenlik açıklarının kapatılması.
*   [ ] **Tam Sürüm (v1.0.0):** Sistemin kararlı sürümünün yayınlanması.

# Manuel Kontrol Talimatları

Projenin son halini test etmek için aşağıdaki adımları izleyebilirsiniz.

## 1. Ön Hazırlık

Proje veritabanı (PostgreSQL) ve önbellek (Redis) servisleri için Docker kullanmaktadır.

1.  **Docker Desktop** uygulamasını başlatın.
2.  Terminali açın ve proje ana dizininde (`c:\Users\Mahmut\Documents\qresto`) şu komutu çalıştırın:
    ```bash
    docker-compose up -d
    ```
    Bu komut veritabanı ve Redis servislerini başlatacaktır.

3.  Veritabanı şemasını güncellemek için (backend klasöründe):
    ```bash
    cd backend
    npx prisma migrate dev --name add_theme_and_indexes
    ```

## 2. Uygulamayı Başlatma

İki ayrı terminal penceresi açın:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Backend `http://localhost:3001` adresinde çalışacaktır.

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Frontend `http://localhost:3000` adresinde çalışacaktır.

## 3. Test Senaryoları

### A. Mutfak Ekranı (Yeni Özellik)
1.  Tarayıcıda `http://localhost:3000/kitchen` adresine gidin.
2.  **Drag & Drop:** "Yeni Siparişler", "Hazırlanıyor" ve "Hazır" sütunları arasında kartları sürükleyip bırakmayı deneyin.
3.  **Ses:** Sağ üstteki ses ikonunun açık olduğundan emin olun. Yeni bir sipariş geldiğinde (veya simüle edildiğinde) ses çalmalıdır.

### B. Tema Sistemi (Yeni Özellik)
1.  Veritabanında bir restoran oluşturun veya mevcut bir restoranın `themeSettings` alanını güncelleyin.
    *   Örnek SQL: `UPDATE "Restaurant" SET "themeSettings" = '{"primaryColor": "#ff0000", "borderRadius": "1rem"}' WHERE id = 1;`
2.  O restoranın menüsüne gidin (QR kod ile veya direkt URL: `/menu/MASA_QR_KODU`).
3.  Renklerin ve kenar yuvarlaklıklarının değiştiğini gözlemleyin.

### C. Resim Yükleme (R2 Entegrasyonu)
1.  Yönetim panelinden (henüz arayüzü hazır değilse Postman ile) bir ürün resmi yüklemeyi deneyin.
2.  `.env` dosyasındaki Cloudflare R2 ayarlarının doğru yapıldığından emin olun.

## Sorun Giderme
-   **Veritabanı Hatası:** Docker konteynerlerinin çalıştığından emin olun (`docker ps`).
-   **Redis Hatası:** Backend loglarında "Redis connection error" olup olmadığını kontrol edin.

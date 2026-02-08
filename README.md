# 🍽️ QResto - QR Menü ve Sipariş Sistemi

Türkiye'deki restoranlar için akıllı QR menü ve sipariş yönetim sistemi.

## ✨ Özellikler

- 📍 **50m Lokasyon Kontrolü** - Sahte siparişleri engeller
- ⏱️ **30 Dakika Oturum Limiti** - Masa devir hızını artırır
- 📱 **Anlık Bildirimler** - Mutfağa real-time sipariş akışı
- 🖼️ **Görsel Menü** - Fotoğraf, alerjen ve diyet bilgileri
- 📊 **Detaylı Raporlar** - Satış analizi ve trendler

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- PostgreSQL (Railway üzerinde)
- npm veya yarn

### Kurulum

1. **Repository'yi klonla:**
```bash
git clone https://github.com/mahmuthasan10/qresto.git
cd qresto
```

2. **Backend kurulumu:**
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle (DATABASE_URL, JWT_SECRET, vb.)
npx prisma generate
npx prisma db push
npm run dev
```

3. **Frontend kurulumu:**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# .env.local dosyasını düzenle
npm run dev
```

4. **Tarayıcıda aç:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `npx prisma studio` (backend klasöründe)

## 📁 Proje Yapısı

```
qresto/
├── backend/               # Express.js API
│   ├── prisma/           # Database schema
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helpers
│   └── package.json
│
├── frontend/             # Next.js 14
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # UI components
│   │   ├── lib/          # API client, socket
│   │   └── stores/       # Zustand stores
│   └── package.json
│
└── docs/                 # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Kayıt
- `POST /api/v1/auth/login` - Giriş
- `POST /api/v1/auth/refresh-token` - Token yenile

### Restaurant
- `GET /api/v1/restaurant/profile` - Profil
- `PUT /api/v1/restaurant/profile` - Güncelle
- `GET /api/v1/restaurant/stats` - İstatistikler

### Menu
- `GET /api/v1/categories` - Kategoriler
- `GET /api/v1/menu-items` - Ürünler
- `POST /api/v1/menu-items` - Ürün ekle

### Orders
- `GET /api/v1/orders` - Siparişler
- `PATCH /api/v1/orders/:id/status` - Durum güncelle

### Public (Müşteri)
- `GET /api/v1/public/menu/:tableQR` - QR ile menü
- `POST /api/v1/public/orders` - Sipariş ver

## 🔧 Ortam Değişkenleri

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 📦 Deployment (Railway)

1. [Railway.app](https://railway.app) hesabı oluştur
2. GitHub repo'yu bağla
3. PostgreSQL ekle
4. Environment variables ayarla
5. Deploy!

## 📄 Lisans

MIT License

---

⭐ Bu projeyi beğendiysen yıldız vermeyi unutma!

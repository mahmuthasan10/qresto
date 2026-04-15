# QResto Production Deploy Checklist

## 1. Ortam Değişkenleri (Railway)

### Backend
| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantısı (pool params dahil) | `postgresql://...?connection_limit=20&pool_timeout=10` |
| `REDIS_URL` | Redis bağlantısı | `redis://default:pwd@host:6379` |
| `JWT_SECRET` | Min 32 karakter rastgele string | `openssl rand -base64 32` ile oluştur |
| `JWT_REFRESH_SECRET` | Min 32 karakter rastgele string | `openssl rand -base64 32` ile oluştur |
| `JWT_EXPIRES_IN` | Access token süresi | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token süresi | `7d` |
| `CORS_ORIGIN` | Frontend URL | `https://qresto.vercel.app` |
| `NODE_ENV` | Ortam | `production` |
| `SENTRY_DSN` | (Opsiyonel) Hata takibi | Sentry dashboard'dan al |
| `CLOUDINARY_CLOUD_NAME` | Görsel yükleme | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary | |
| `CLOUDINARY_API_SECRET` | Cloudinary | |

### Frontend (Vercel)
| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://qresto-backend.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io URL (Backend ile aynı) | `https://qresto-backend.up.railway.app` |
| `NEXT_PUBLIC_SENTRY_DSN` | (Opsiyonel) Sentry frontend | Sentry dashboard'dan al |
| `SENTRY_ORG` | (Opsiyonel) Sentry org slug | |
| `SENTRY_PROJECT` | (Opsiyonel) Sentry project | `qresto-frontend` |
| `SENTRY_AUTH_TOKEN` | (Opsiyonel) Source map upload | |

---

## 2. Güvenlik Kontrolleri

- [ ] `NODE_ENV=production` set edildi
- [ ] Debug endpoint'leri production'da kapalı (`NODE_ENV` kontrolü ✅ yapıldı)
- [ ] JWT secret'ları en az 32 karakter
- [ ] `CORS_ORIGIN` wildcard (`*`) değil, spesifik domain
- [ ] HTTPS zorunlu (Railway + Vercel otomatik sağlar)
- [ ] Rate limiting aktif (`RATE_LIMIT_MAX_REQUESTS=100`)
- [ ] Socket.io auth middleware aktif ✅
- [ ] Session extend limiti aktif (max 3 uzatma) ✅

---

## 3. Veritabanı

- [ ] Prisma migration'ları deploy edildi (`npx prisma migrate deploy`)
- [ ] `connection_limit=20&pool_timeout=10` parametreleri DATABASE_URL'de
- [ ] Compound index'ler migration'da mevcut ✅
- [ ] Railway PostgreSQL backup açık (otomatik günlük)

---

## 4. Performance

- [ ] Redis bağlantısı çalışıyor (`/api/v1/health` endpoint kontrolü)
- [ ] Menü cache TTL 5 dakika ✅
- [ ] Socket.io Redis adapter bağlı (log kontrolü)
- [ ] k6 load test çalıştırıldı ve p95 < 500ms ✅

---

## 5. Monitoring

- [ ] `GET /api/v1/health` → status: OK
- [ ] Sentry DSN set edildi ve test eventi atıldı
- [ ] Railway metric alert'ları kuruldu (memory > 512MB)
- [ ] Uptime monitoring (UptimeRobot / BetterStack ücretsiz tier)

---

## 6. Son Test

```bash
# Health check
curl https://your-backend.up.railway.app/api/v1/health

# Menü yükleme (cache test)
curl https://your-backend.up.railway.app/api/v1/public/menu/TEST_QR

# k6 load test
k6 run \
  --env BASE_URL=https://your-backend.up.railway.app/api/v1 \
  --env TEST_QR_CODE=your-qr-code \
  --env MENU_ITEM_ID=1 \
  tests/k6/load_test.js
```

---

## 7. Rollback Planı

Railway otomatik rollback destekler:
1. Railway dashboard → Deploy → önceki deploy'a tıkla → **Rollback**
2. Prisma migration rollback gerekiyorsa: `npx prisma migrate reset` (DİKKAT: veri silinir)
3. Acil durumda: railway.toml'dan `startCommand`'ı `node src/index.js`'e düşür (migration atla)

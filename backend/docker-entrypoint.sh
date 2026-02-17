#!/bin/sh
set -e

echo "🔄 Database migration kontrolü başlatılıyor..."

# _prisma_migrations tablosu var mı kontrol et
# db push ile oluşturulmuş DB'lerde bu tablo yoktur
TABLE_EXISTS=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRaw\`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_prisma_migrations')\`
  .then(r => { console.log(r[0].exists ? 'true' : 'false'); process.exit(0); })
  .catch(() => { console.log('false'); process.exit(0); });
" 2>/dev/null || echo "false")

if [ "$TABLE_EXISTS" = "true" ]; then
  echo "✅ Migration tablosu mevcut, migrate deploy çalıştırılıyor..."
  npx prisma migrate deploy 2>&1
else
  echo "⚠️ Migration tablosu bulunamadı (db push ile oluşturulmuş DB)"
  echo "📌 Mevcut migration'lar baseline olarak işaretleniyor..."
  
  # Tüm mevcut migration'ları 'already applied' olarak resolve et
  for dir in prisma/migrations/*/; do
    if [ -f "$dir/migration.sql" ]; then
      migration_name=$(basename "$dir")
      echo "  → $migration_name resolve ediliyor..."
      npx prisma migrate resolve --applied "$migration_name" 2>&1 || true
    fi
  done
  
  echo "✅ Baseline tamamlandı. Gelecek migration'lar otomatik uygulanacak."
fi

echo "🚀 Server başlatılıyor..."
exec node src/index.js

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

EXPOSE 3001

# 1) Migration'ları uygula (başarısız olsa bile devam et)
# 2) Sunucuyu başlat
CMD ["sh", "-c", "(npx prisma migrate deploy 2>&1 || echo 'Migration warning - continuing...') && node src/index.js"]

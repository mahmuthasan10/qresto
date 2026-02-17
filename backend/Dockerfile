FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3001

# db push (accept-data-loss OLMADAN): şemayı senkronize eder, yıkıcı değişiklik varsa hata verir
CMD ["sh", "-c", "npx prisma db push --skip-generate 2>&1 && node src/index.js"]

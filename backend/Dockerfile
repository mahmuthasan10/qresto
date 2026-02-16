FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/index.js"]

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  },
};

// NEXT_PUBLIC_SENTRY_DSN yoksa Sentry plugin'i atla (dev ortamı için güvenli)
const sentryConfig = {
  // Source map'leri Sentry'ye gönder (production'da hata satır numaraları görünsün)
  silent: true, // CI loglarını temiz tut
  org: process.env.SENTRY_ORG || '',
  project: process.env.SENTRY_PROJECT || 'qresto-frontend',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Source map'leri Vercel'de bundle içinde bırakma (bundle boyutu küçülür)
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;

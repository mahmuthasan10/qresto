/**
 * Sentry client-side (tarayıcı) yapılandırması
 * Next.js App Router ile otomatik yüklenir.
 *
 * NEXT_PUBLIC_SENTRY_DSN ortam değişkeni yoksa devre dışı kalır.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,

        // Performans izleme: production'da %10, dev'de %100
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Session replay: hata anında son 10 saniyeyi kaydet
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.05,

        integrations: [
            Sentry.replayIntegration({
                // Kullanıcı verilerini gizle
                maskAllText: true,
                blockAllMedia: false,
            }),
        ],

        beforeSend(event) {
            // Yerel geliştirme ortamında konsola yazdır, Sentry'ye gönderme
            if (process.env.NODE_ENV === 'development') {
                console.error('[Sentry dev]', event);
                return null;
            }
            return event;
        },
    });
}

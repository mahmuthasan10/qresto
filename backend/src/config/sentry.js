/**
 * Sentry error tracking yapılandırması
 *
 * SENTRY_DSN ortam değişkeni yoksa hiçbir şey yapmaz (dev ortamı için güvenli).
 * Production'da Railway ortam değişkenleri aracılığıyla set edilir.
 */
const Sentry = require('@sentry/node');

function initSentry() {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        // Dev ortamında sessizce geç
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.npm_package_version || '1.0.0',

        // Performans izleme: her 10 istekte 1 örnek al (production'da düşük tutulur)
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Kişisel veri göndermemek için bazı alanları maskele
        beforeSend(event) {
            // İstekte Authorization veya cookie header'larını temizle
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
                delete event.request.headers['x-session-token'];
            }
            return event;
        },
    });
}

module.exports = { initSentry, Sentry };

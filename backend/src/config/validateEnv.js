const { logger } = require('../utils/logger');

/**
 * Production ortamında zorunlu env değişkenlerini kontrol eder.
 * Eksik varsa sunucu başlamaz.
 */
function validateEnv() {
    if (process.env.NODE_ENV !== 'production') return;

    const required = [
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'CORS_ORIGIN',
        'FRONTEND_URL',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        logger.error(`FATAL: Missing required env vars in production: ${missing.join(', ')}`);
        process.exit(1);
    }

    // JWT secret minimum uzunluk kontrolü
    if (process.env.JWT_SECRET.length < 32) {
        logger.error('FATAL: JWT_SECRET must be at least 32 characters in production');
        process.exit(1);
    }

    if (process.env.JWT_REFRESH_SECRET.length < 32) {
        logger.error('FATAL: JWT_REFRESH_SECRET must be at least 32 characters in production');
        process.exit(1);
    }
}

module.exports = { validateEnv };

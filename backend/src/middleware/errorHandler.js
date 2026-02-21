const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Bu kayıt zaten mevcut',
            field: err.meta?.target?.[0]
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Kayıt bulunamadı'
        });
    }

    // Validation errors (Joi)
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Geçersiz veri',
            details: err.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
            }))
        });
    }

    // Multer errors (dosya yükleme)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Dosya boyutu çok büyük. Maksimum 5MB yüklenebilir.'
            });
        }
        return res.status(400).json({
            error: 'Dosya yükleme hatası: ' + err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Geçersiz token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token süresi dolmuş'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Bir hata oluştu'
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

module.exports = errorHandler;

const xss = require('xss');

/**
 * Tüm req.body string alanlarını XSS'den temizler.
 * JSON body parse edildikten sonra, route'lardan önce kullanılmalı.
 */
function sanitizeStrings(obj) {
    if (typeof obj === 'string') {
        return xss(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeStrings);
    }
    if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key of Object.keys(obj)) {
            cleaned[key] = sanitizeStrings(obj[key]);
        }
        return cleaned;
    }
    return obj;
}

function sanitizeInput(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeStrings(req.body);
    }
    next();
}

module.exports = { sanitizeInput };

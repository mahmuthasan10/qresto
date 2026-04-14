/**
 * autoExtendSession middleware
 *
 * Her public API isteğinde x-session-token header'ı okunur.
 * Session'ın süresi 10 dakikadan az kaldıysa otomatik olarak 10 dakika uzatılır.
 * Bu uzatma extensionCount'a sayılmaz — kullanıcı deneyimini korumak içindir.
 */
const { redisClient } = require('../config/redis');
const prisma = require('../config/database');

const AUTO_EXTEND_THRESHOLD_MS = 10 * 60 * 1000; // Kalan süre 10 dk'dan azsa uzat
const AUTO_EXTEND_MINUTES = 10; // 10 dakika uzat

module.exports = async function autoExtendSession(req, res, next) {
    const token = req.headers['x-session-token'];
    if (!token) return next();

    try {
        const key = `session:${token}`;
        const cachedStr = await redisClient.get(key);

        if (!cachedStr) return next();

        const sessionData = JSON.parse(cachedStr);
        const expiresAt = new Date(sessionData.expiresAt);
        const now = new Date();
        const remainingMs = expiresAt.getTime() - now.getTime();

        // Süresi dolmuşsa dokunma
        if (remainingMs <= 0) return next();

        // Eşiğin üstündeyse uzatmaya gerek yok
        if (remainingMs >= AUTO_EXTEND_THRESHOLD_MS) return next();

        // Session'ı uzat
        const newExpiresAt = new Date(now.getTime() + AUTO_EXTEND_MINUTES * 60 * 1000);
        sessionData.expiresAt = newExpiresAt.toISOString();

        const ttlSeconds = AUTO_EXTEND_MINUTES * 60;
        await redisClient.set(key, JSON.stringify(sessionData), 'EX', ttlSeconds);

        // DB'yi asenkron güncelle (isteği bloklamamak için await yok)
        prisma.session.update({
            where: { sessionToken: token },
            data: {
                expiresAt: newExpiresAt,
                lastActivityAt: now,
            },
        }).catch(() => {
            // Sessizce yoksay — DB hatası isteği bozmamalı
        });

        // Frontend'in güncelleme yapabilmesi için header'a yeni expiry'yi ekle
        res.setHeader('x-session-extended', 'true');
        res.setHeader('x-session-expires-at', newExpiresAt.toISOString());
    } catch {
        // Middleware hatası asla isteği bloklamamalı
    }

    next();
};

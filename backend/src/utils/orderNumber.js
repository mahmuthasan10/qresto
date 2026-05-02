const { redisClient } = require('../config/redis');
const prisma = require('../config/database');

/**
 * Atomik sipariş numarası üretici.
 * Redis INCR ile race condition olmaz. Redis erişilemezse DB count fallback.
 *
 * @param {number} restaurantId
 * @param {string} [prefix='ORD'] - Sipariş numarası ön eki (ORD, TRT vb.)
 * @returns {Promise<string>} Örn: "ORD-20260415-001" veya "TRT-20260415-012"
 */
async function generateOrderNumber(restaurantId, prefix = 'ORD') {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const redisKey = `qresto:order_counter:${restaurantId}:${prefix}:${dateStr}`;

    try {
        const counter = await redisClient.incr(redisKey);
        if (counter === 1) {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setDate(midnight.getDate() + 1);
            midnight.setHours(2, 0, 0, 0); // Gece yarisi + 2 saat buffer
            const ttl = Math.round((midnight.getTime() - now.getTime()) / 1000);
            await redisClient.expire(redisKey, ttl);
        }
        return `${prefix}-${dateStr}-${String(counter).padStart(3, '0')}`;
    } catch {
        // Redis erişilemez: DB count fallback
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const count = await prisma.order.count({
            where: { restaurantId, createdAt: { gte: startOfDay } }
        });
        return `${prefix}-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    }
}

module.exports = { generateOrderNumber };

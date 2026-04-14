const { redisClient } = require('../config/redis');
const prisma = require('../config/database');

/**
 * Bir restoranın tüm masa menu cache'lerini siler.
 * Menu item veya kategori güncellendiğinde çağrılır.
 *
 * @param {number} restaurantId
 */
const invalidateMenuCache = async (restaurantId) => {
    try {
        // Restorana ait tüm masaların QR kodlarını al
        const tables = await prisma.table.findMany({
            where: { restaurantId },
            select: { qrCode: true }
        });

        if (tables.length === 0) return;

        const keys = tables.map(t => `qresto:menu:${t.qrCode}`);
        await redisClient.del(...keys);
    } catch {
        // Cache invalidation başarısız olursa sessizce geç -- stale cache 5 dk sonra expire olur
    }
};

module.exports = { invalidateMenuCache };

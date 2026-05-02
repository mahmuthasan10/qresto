const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Yetkilendirme token\'ı gerekli' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check token blacklist (logout)
        const { redisClient } = require('../config/redis');
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token geçersiz (çıkış yapılmış)' });
        }

        // Get restaurant (Redis cache with 60s TTL, then DB fallback)
        const cacheKey = `restaurant:${decoded.restaurantId}`;
        let restaurant;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            restaurant = JSON.parse(cached);
        } else {
            restaurant = await prisma.restaurant.findUnique({
                where: { id: decoded.restaurantId }
            });
            if (restaurant) {
                await redisClient.set(cacheKey, JSON.stringify(restaurant), 'EX', 60);
            }
        }

        if (!restaurant) {
            return res.status(401).json({ error: 'Restoran bulunamadı' });
        }

        if (!restaurant.isActive) {
            return res.status(403).json({ error: 'Bu hesap devre dışı' });
        }

        req.restaurant = restaurant;
        req.restaurantId = restaurant.id;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticate };

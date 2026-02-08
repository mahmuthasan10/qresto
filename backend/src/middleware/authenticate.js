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

        // Get restaurant from database
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: decoded.restaurantId }
        });

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

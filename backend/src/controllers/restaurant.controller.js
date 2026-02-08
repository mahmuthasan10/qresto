const prisma = require('../config/database');
const Joi = require('joi');

// Validation schemas
const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().max(20).optional().allow(''),
    address: Joi.string().optional().allow('')
});

const updateLocationSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    locationRadius: Joi.number().min(10).max(500).optional()
});

const updateSettingsSchema = Joi.object({
    sessionTimeout: Joi.number().min(5).max(120).optional(),
    locationRadius: Joi.number().min(10).max(500).optional()
});

exports.getProfile = async (req, res, next) => {
    try {
        const { passwordHash, ...restaurant } = req.restaurant;
        res.json({ restaurant });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const restaurant = await prisma.restaurant.update({
            where: { id: req.restaurantId },
            data: value,
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                phone: true,
                address: true,
                latitude: true,
                longitude: true,
                locationRadius: true,
                sessionTimeout: true,
                logoUrl: true,
                subscriptionPlan: true,
                updatedAt: true
            }
        });

        res.json({ restaurant });
    } catch (error) {
        next(error);
    }
};

exports.updateLocation = async (req, res, next) => {
    try {
        const { error, value } = updateLocationSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const restaurant = await prisma.restaurant.update({
            where: { id: req.restaurantId },
            data: value,
            select: {
                id: true,
                latitude: true,
                longitude: true,
                locationRadius: true,
                updatedAt: true
            }
        });

        res.json({ restaurant });
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const { error, value } = updateSettingsSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const restaurant = await prisma.restaurant.update({
            where: { id: req.restaurantId },
            data: value,
            select: {
                id: true,
                sessionTimeout: true,
                locationRadius: true,
                updatedAt: true
            }
        });

        res.json({ restaurant });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayOrders, totalOrders, activeTables, revenue] = await Promise.all([
            // Bugünkü siparişler
            prisma.order.count({
                where: {
                    restaurantId: req.restaurantId,
                    createdAt: { gte: today }
                }
            }),
            // Toplam siparişler
            prisma.order.count({
                where: { restaurantId: req.restaurantId }
            }),
            // Aktif masalar
            prisma.session.count({
                where: {
                    restaurantId: req.restaurantId,
                    isActive: true,
                    expiresAt: { gt: new Date() }
                }
            }),
            // Bugünkü gelir
            prisma.order.aggregate({
                where: {
                    restaurantId: req.restaurantId,
                    createdAt: { gte: today },
                    status: { not: 'cancelled' }
                },
                _sum: { totalAmount: true }
            })
        ]);

        res.json({
            stats: {
                todayOrders,
                totalOrders,
                activeTables,
                todayRevenue: revenue._sum.totalAmount || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getDailyStats = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const results = [];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [orderCount, revenue] = await Promise.all([
                prisma.order.count({
                    where: {
                        restaurantId: req.restaurantId,
                        createdAt: { gte: date, lt: nextDate }
                    }
                }),
                prisma.order.aggregate({
                    where: {
                        restaurantId: req.restaurantId,
                        createdAt: { gte: date, lt: nextDate },
                        status: { not: 'cancelled' }
                    },
                    _sum: { totalAmount: true }
                })
            ]);

            results.push({
                date: date.toISOString().split('T')[0],
                orders: orderCount,
                revenue: revenue._sum.totalAmount || 0
            });
        }

        res.json({ dailyStats: results.reverse() });
    } catch (error) {
        next(error);
    }
};

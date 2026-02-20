const prisma = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Tarih aralığı hesapla (max 30 gün)
 */
function getDateRange(period) {
    const days = Math.max(1, Math.min(30, parseInt(period) || 7));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, days };
}

/**
 * GET /api/v1/analytics/summary?period=7
 * Belirli dönem özeti: sipariş sayısı, gelir, ortalama sipariş, aktif masa
 */
exports.getSummary = async (req, res, next) => {
    try {
        const { startDate } = getDateRange(req.query.period);
        const restaurantId = req.restaurantId;

        const [orderCount, revenue, activeTables, cancelledCount] = await Promise.all([
            // Toplam sipariş sayısı (iptal dahil)
            prisma.order.count({
                where: {
                    restaurantId,
                    createdAt: { gte: startDate }
                }
            }),
            // Toplam gelir (iptal hariç)
            prisma.order.aggregate({
                where: {
                    restaurantId,
                    createdAt: { gte: startDate },
                    status: { not: 'cancelled' }
                },
                _sum: { totalAmount: true }
            }),
            // Aktif masa sayısı (şu an)
            prisma.session.count({
                where: {
                    restaurantId,
                    isActive: true,
                    expiresAt: { gt: new Date() }
                }
            }),
            // İptal edilen sipariş sayısı
            prisma.order.count({
                where: {
                    restaurantId,
                    createdAt: { gte: startDate },
                    status: 'cancelled'
                }
            })
        ]);

        const totalRevenue = Number(revenue._sum.totalAmount || 0);
        const validOrders = orderCount - cancelledCount;
        const averageOrderValue = validOrders > 0 ? totalRevenue / validOrders : 0;

        res.json({
            summary: {
                totalOrders: orderCount,
                totalRevenue,
                averageOrderValue: Math.round(averageOrderValue * 100) / 100,
                activeTables,
                cancelledOrders: cancelledCount,
                completionRate: orderCount > 0
                    ? Math.round(((orderCount - cancelledCount) / orderCount) * 100)
                    : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/analytics/daily?period=7
 * Günlük sipariş ve gelir trendi
 */
exports.getDailyTrend = async (req, res, next) => {
    try {
        const { startDate, days } = getDateRange(req.query.period);
        const restaurantId = req.restaurantId;

        const results = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [orderCount, revenue] = await Promise.all([
                prisma.order.count({
                    where: {
                        restaurantId,
                        createdAt: { gte: date, lt: nextDate }
                    }
                }),
                prisma.order.aggregate({
                    where: {
                        restaurantId,
                        createdAt: { gte: date, lt: nextDate },
                        status: { not: 'cancelled' }
                    },
                    _sum: { totalAmount: true }
                })
            ]);

            results.push({
                date: date.toISOString().split('T')[0],
                orders: orderCount,
                revenue: Number(revenue._sum.totalAmount || 0)
            });
        }

        res.json({ dailyTrend: results });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/analytics/top-items?period=7&limit=5
 * En çok satan ürünler
 */
exports.getTopItems = async (req, res, next) => {
    try {
        const { startDate } = getDateRange(req.query.period);
        const limit = Math.max(1, Math.min(20, parseInt(req.query.limit) || 5));
        const restaurantId = req.restaurantId;

        const topItems = await prisma.orderItem.groupBy({
            by: ['itemName'],
            where: {
                order: {
                    restaurantId,
                    createdAt: { gte: startDate },
                    status: { not: 'cancelled' }
                }
            },
            _sum: {
                quantity: true,
                subtotal: true
            },
            orderBy: {
                _sum: { quantity: 'desc' }
            },
            take: limit
        });

        res.json({
            topItems: topItems.map((item, index) => ({
                rank: index + 1,
                name: item.itemName,
                totalQuantity: item._sum.quantity || 0,
                totalRevenue: Number(item._sum.subtotal || 0)
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/analytics/status-distribution?period=7
 * Sipariş durum dağılımı (pie chart için)
 */
exports.getStatusDistribution = async (req, res, next) => {
    try {
        const { startDate } = getDateRange(req.query.period);
        const restaurantId = req.restaurantId;

        const distribution = await prisma.order.groupBy({
            by: ['status'],
            where: {
                restaurantId,
                createdAt: { gte: startDate }
            },
            _count: { id: true }
        });

        const statusLabels = {
            pending: 'Beklemede',
            confirmed: 'Onaylandı',
            preparing: 'Hazırlanıyor',
            ready: 'Hazır',
            completed: 'Tamamlandı',
            cancelled: 'İptal'
        };

        const statusColors = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            preparing: '#8b5cf6',
            ready: '#10b981',
            completed: '#6b7280',
            cancelled: '#ef4444'
        };

        res.json({
            statusDistribution: distribution.map(item => ({
                status: item.status,
                label: statusLabels[item.status] || item.status,
                count: item._count.id,
                color: statusColors[item.status] || '#9ca3af'
            }))
        });
    } catch (error) {
        next(error);
    }
};

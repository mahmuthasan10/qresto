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
 * PostgreSQL-specific $queryRaw yerine Prisma findMany + JS gruplama
 */
exports.getDailyTrend = async (req, res, next) => {
    try {
        const { startDate, days } = getDateRange(req.query.period);
        const restaurantId = req.restaurantId;

        // Tek sorguda dönem içindeki tüm siparişleri çek (sadece gereken alanlar)
        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true,
                status: true,
                totalAmount: true
            }
        });

        // JavaScript tarafında gün bazlı grupla
        const orderMap = {};
        for (const order of orders) {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!orderMap[dateStr]) {
                orderMap[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
            }
            orderMap[dateStr].orders += 1;
            if (order.status !== 'cancelled') {
                orderMap[dateStr].revenue += Number(order.totalAmount);
            }
        }

        // Boş günleri de dahil et
        const results = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const entry = orderMap[dateStr] || { date: dateStr, orders: 0, revenue: 0 };
            // Geliri iki ondalığa yuvarla
            entry.revenue = Math.round(entry.revenue * 100) / 100;
            results.push(entry);
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

        // groupBy yerine findMany kullanıp JS tarafında gruplama (Prisma ilişkisel where kısıtlamasını aşmak için)
        const items = await prisma.orderItem.findMany({
            where: {
                order: {
                    restaurantId,
                    createdAt: { gte: startDate },
                    status: { not: 'cancelled' }
                }
            },
            select: {
                itemName: true,
                quantity: true,
                subtotal: true
            }
        });

        // JavaScript tarafında gruplama
        const itemMap = {};
        for (const item of items) {
            if (!itemMap[item.itemName]) {
                itemMap[item.itemName] = { quantity: 0, subtotal: 0 };
            }
            itemMap[item.itemName].quantity += item.quantity;
            itemMap[item.itemName].subtotal += Number(item.subtotal);
        }

        // Array'e çevir, sırala ve limit uygula
        const topItems = Object.entries(itemMap)
            .map(([name, stats]) => ({
                name,
                totalQuantity: stats.quantity,
                totalRevenue: Math.round(stats.subtotal * 100) / 100
            }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limit)
            .map((item, index) => ({
                rank: index + 1,
                ...item
            }));

        res.json({ topItems });
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

const prisma = require('../config/database');
const Joi = require('joi');
const { logger } = require('../utils/logger');

const statusValues = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

const updateStatusSchema = Joi.object({
    status: Joi.string().valid(...statusValues).required(),
    cancellationReason: Joi.string().optional().when('status', {
        is: 'cancelled',
        then: Joi.string().required()
    })
});

exports.getAll = async (req, res, next) => {
    try {
        const { status, tableId, page = 1, limit = 20 } = req.query;

        const where = { restaurantId: req.restaurantId };
        if (status) where.status = status;
        if (tableId) where.tableId = parseInt(tableId);

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    orderItems: true,
                    table: { select: { tableNumber: true, tableName: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            }),
            prisma.order.count({ where })
        ]);

        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getActive = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                restaurantId: req.restaurantId,
                status: { in: ['pending', 'confirmed', 'preparing', 'ready'] }
            },
            include: {
                orderItems: true,
                table: { select: { tableNumber: true, tableName: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};

exports.getKitchen = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                restaurantId: req.restaurantId,
                status: { in: ['pending', 'confirmed', 'preparing', 'ready'] }
            },
            include: {
                orderItems: {
                    select: {
                        id: true,
                        itemName: true,
                        quantity: true,
                        notes: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};


exports.getHistory = async (req, res, next) => {
    try {
        const { startDate, endDate, page = 1, limit = 50 } = req.query;

        const where = {
            restaurantId: req.restaurantId,
            status: { in: ['completed', 'cancelled'] }
        };

        if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
        if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

        const orders = await prisma.order.findMany({
            where,
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    // This is for admin creating orders manually
    // Customer orders go through public.controller.js
    res.status(501).json({ message: 'Admin sipariş oluşturma - henüz implement edilmedi' });
};

exports.getById = async (req, res, next) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId },
            include: {
                orderItems: { include: { menuItem: { select: { imageUrl: true } } } },
                table: { select: { tableNumber: true, tableName: true } },
                session: { select: { startedAt: true, deviceInfo: true } }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        res.json({ order });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { error, value } = updateStatusSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        const oldStatus = order.status;
        const newStatus = value.status;

        // Build update data
        const updateData = { status: newStatus };
        const now = new Date();

        switch (newStatus) {
            case 'confirmed':
                updateData.confirmedAt = now;
                break;
            case 'preparing':
                updateData.preparingAt = now;
                break;
            case 'ready':
                updateData.readyAt = now;
                break;
            case 'completed':
                updateData.completedAt = now;
                break;
            case 'cancelled':
                updateData.cancelledAt = now;
                updateData.cancellationReason = value.cancellationReason;
                break;
        }

        const updated = await prisma.order.update({
            where: { id: order.id },
            data: updateData,
            include: { orderItems: true, table: { select: { tableNumber: true } } }
        });

        const io = req.app.get('io');
        // Emit real-time update
        if (io) {
            io.to(`restaurant_${req.restaurantId}`).emit('order_status_updated', {
                orderId: updated.id,
                orderNumber: updated.orderNumber,
                status: updated.status,
                tableNumber: updated.tableNumber
            });
            logger.info(`Order ${updated.orderNumber} status updated: ${oldStatus} -> ${newStatus}`);
        }

        res.json({ order: updated });
    } catch (error) {
        logger.error('Update status error:', error);
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), restaurantId: req.restaurantId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        if (['completed', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ error: 'Bu sipariş iptal edilemez' });
        }

        const cancelled = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: reason || 'Admin tarafından iptal edildi'
            }
        });

        // Emit real-time update
        const io = req.app.get('io');
        io.to(`restaurant_${req.restaurantId}`).emit('order_status_updated', {
            orderId: cancelled.id,
            orderNumber: cancelled.orderNumber,
            status: 'cancelled'
        });

        res.json({ order: cancelled });
    } catch (error) {
        next(error);
    }
};

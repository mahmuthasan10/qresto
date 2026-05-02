const prisma = require('../config/database');
const Joi = require('joi');
const { logger } = require('../utils/logger');
const { generateOrderNumber } = require('../utils/orderNumber');

const createTreatSchema = Joi.object({
    fromTableId: Joi.number().integer().positive().required(),
    toTableId: Joi.number().integer().positive().required(),
    menuItemId: Joi.number().integer().positive().required(),
    note: Joi.string().max(500).optional().allow('', null)
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED', 'CANCELLED').required()
});

const TreatController = {
    // Create a treat request
    async createTreat(req, res) {
        try {
            const { error, value } = createTreatSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const { fromTableId, toTableId, menuItemId, note } = value;

            if (fromTableId === toTableId) {
                return res.status(400).json({ error: 'Kendinize ikram edemezsiniz' });
            }

            // Masalarin ayni restorana ait oldugunuu dogrula
            const [fromTable, toTable] = await Promise.all([
                prisma.table.findUnique({ where: { id: parseInt(fromTableId) }, select: { id: true, restaurantId: true } }),
                prisma.table.findUnique({ where: { id: parseInt(toTableId) }, select: { id: true, restaurantId: true } })
            ]);

            if (!fromTable || !toTable) {
                return res.status(404).json({ error: 'Masa bulunamadi' });
            }

            if (fromTable.restaurantId !== toTable.restaurantId) {
                return res.status(400).json({ error: 'Masalar ayni restorana ait degil' });
            }

            const treat = await prisma.treat.create({
                data: {
                    fromTableId: parseInt(fromTableId),
                    toTableId: parseInt(toTableId),
                    menuItemId: parseInt(menuItemId),
                    note,
                    status: 'PENDING'
                },
                include: {
                    menuItem: true,
                    fromTable: true,
                    toTable: true
                }
            });

            // Notify via Socket.IO (to Admin and maybe Kitchen/Destination Table)
            const io = req.app.get('io');
            if (io) {
                io.to(`restaurant_${fromTable.restaurantId}`).emit('new_treat', treat);
            }

            res.status(201).json(treat);
        } catch (error) {
            logger.error('Create treat error:', error);
            res.status(500).json({ error: 'İkram oluşturulamadı' });
        }
    },

    // Get all treats (for admin)
    async getAllTreats(req, res) {
        try {
            const restaurantId = req.restaurantId; // Authenticated admin

            const treats = await prisma.treat.findMany({
                where: {
                    fromTable: { restaurantId: parseInt(restaurantId) }
                },
                include: {
                    fromTable: true,
                    toTable: true,
                    menuItem: true
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(treats);
        } catch (error) {
            logger.error('Get treats error:', error);
            res.status(500).json({ error: 'İkramlar getirilemedi' });
        }
    },

    // Update status (cancel, approve, reject)
    async updateStatus(req, res) {
        try {
            const { id } = req.params;

            const { error, value } = updateStatusSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const { status } = value;

            // First get the treat to have details
            const currentTreat = await prisma.treat.findUnique({
                where: { id: parseInt(id) },
                include: { menuItem: true }
            });

            if (!currentTreat) {
                return res.status(404).json({ error: 'İkram bulunamadı' });
            }

            const io = req.app.get('io');

            // If Approved, update treat + create order atomically in a transaction
            if (status === 'APPROVED' && currentTreat.status !== 'APPROVED') {
                const orderNumber = await generateOrderNumber(currentTreat.toTableId ? (await prisma.table.findUnique({ where: { id: currentTreat.toTableId }, select: { restaurantId: true } }))?.restaurantId : 0, 'TRT');

                const activeSession = await prisma.session.findFirst({
                    where: {
                        tableId: currentTreat.toTableId,
                        isActive: true,
                        expiresAt: { gt: new Date() }
                    },
                    orderBy: { startedAt: 'desc' }
                });

                const [treat, newOrder] = await prisma.$transaction(async (tx) => {
                    const updatedTreat = await tx.treat.update({
                        where: { id: parseInt(id) },
                        data: { status },
                        include: { fromTable: true, toTable: true, menuItem: true }
                    });

                    const order = await tx.order.create({
                        data: {
                            restaurantId: updatedTreat.toTable.restaurantId,
                            tableId: updatedTreat.toTableId,
                            sessionId: activeSession ? activeSession.id : null,
                            tableNumber: String(updatedTreat.toTable.tableNumber),
                            orderNumber,
                            status: 'pending',
                            totalAmount: 0,
                            paymentMethod: 'cash',
                            customerNotes: `İKRAM - Masa ${updatedTreat.fromTable.tableNumber} tarafindan ikram! ${updatedTreat.note ? `Not: ${updatedTreat.note}` : ''}`,
                            orderItems: {
                                create: [{
                                    menuItemId: updatedTreat.menuItemId,
                                    itemName: updatedTreat.menuItem.name,
                                    quantity: 1,
                                    unitPrice: 0,
                                    subtotal: 0,
                                    notes: updatedTreat.note || null
                                }]
                            }
                        },
                        include: { orderItems: true }
                    });

                    return [updatedTreat, order];
                });

                if (io) {
                    const restaurantRoom = `restaurant_${treat.toTable.restaurantId}`;
                    io.to(restaurantRoom).emit('new_order', {
                        id: newOrder.id,
                        orderNumber: newOrder.orderNumber,
                        tableId: newOrder.tableId,
                        tableNumber: newOrder.tableNumber,
                        status: newOrder.status,
                        totalAmount: newOrder.totalAmount,
                        paymentMethod: newOrder.paymentMethod,
                        customerNotes: newOrder.customerNotes,
                        createdAt: newOrder.createdAt,
                        orderItems: newOrder.orderItems.map(item => ({
                            id: item.id,
                            itemName: item.itemName,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            subtotal: item.subtotal,
                            notes: item.notes || undefined,
                        })),
                    });
                    logger.info(`Treat approved, created order #${newOrder.orderNumber}`);
                }

                // Notify treat status update
                if (io) {
                    const restaurantId = treat.fromTable?.restaurantId || treat.toTable?.restaurantId;
                    if (restaurantId) {
                        io.to(`restaurant_${restaurantId}`).emit('treat_status_updated', treat);
                    }
                }

                return res.json(treat);
            }

            // Non-APPROVED status updates (REJECTED, CANCELLED)
            const treat = await prisma.treat.update({
                where: { id: parseInt(id) },
                data: { status },
                include: { fromTable: true, toTable: true, menuItem: true }
            });

            // Notify update (for Admin UI etc)
            if (io) {
                const restaurantId = treat.fromTable?.restaurantId || treat.toTable?.restaurantId;
                if (restaurantId) {
                    io.to(`restaurant_${restaurantId}`).emit('treat_status_updated', treat);
                }
            }

            res.json(treat);
        } catch (error) {
            logger.error('Update treat status error:', error);
            res.status(500).json({ error: 'Durum güncellenemedi' });
        }
    },

    // Get active tables suitable for treating
    async getActiveTables(req, res) {
        try {
            const { qrCode } = req.params; // Using qrCode to identify restaurant scope? 
            // Or better, pass current table ID to exclude self.
            // Let's assume we get restaurantId from query or inferred from current session.

            // Getting restaurant via a known table's QR or session is safer.
            // For now, let's assume we pass restaurantId in query or find via a param.
            // Let's use a simple approach: if user is logged in menu (session), we know the restaurant.
            // But this might be a public endpoint called by the customer frontend.
            // Let's check how we get restaurant context.
            // Usually via the QR code in the URL.

            const restaurantId = parseInt(req.query.restaurantId);

            if (!restaurantId || isNaN(restaurantId) || restaurantId <= 0) {
                return res.status(400).json({ error: 'Geçerli bir Restaurant ID gerekli' });
            }

            const activeTables = await prisma.table.findMany({
                where: {
                    restaurantId,
                    isActive: true
                    // In a real scenario, we check for sessions.
                    // sessions: { some: { isActive: true } }
                },
                select: {
                    id: true,
                    tableNumber: true,
                    tableName: true
                }
            });

            res.json(activeTables);
        } catch (error) {
            logger.error('Get active tables error:', error);
            res.status(500).json({ error: 'Masalar getirilemedi' });
        }
    }
};

module.exports = TreatController;

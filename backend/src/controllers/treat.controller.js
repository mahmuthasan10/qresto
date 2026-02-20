const prisma = require('../config/database');
const Joi = require('joi');
const { logger } = require('../utils/logger');

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
                // Notify logic here (omitted for brevity, can add later)
                io.emit('new_treat', treat);
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

            const treat = await prisma.treat.update({
                where: { id: parseInt(id) },
                data: { status },
                include: {
                    fromTable: true,
                    toTable: true,
                    menuItem: true
                }
            });

            const io = req.app.get('io');

            // If Approved, create an Order for the destination table so it appears in Kitchen
            if (status === 'APPROVED' && currentTreat.status !== 'APPROVED') {
                try {
                    // Generate a unique order number (simple timestamp based for now)
                    const orderNumber = `TRT-${Date.now().toString().slice(-6)}`;

                    const newOrder = await prisma.order.create({
                        data: {
                            restaurantId: treat.toTable.restaurantId,
                            tableId: treat.toTableId,
                            tableNumber: treat.toTable.tableNumber,
                            orderNumber: orderNumber,
                            status: 'confirmed', // Directly confirmed so kitchen sees it
                            totalAmount: 0, // It's a treat for the receiver
                            isTreat: true, // You might want to add this field to schema later, for now just logic
                            customerNotes: `Masa ${treat.fromTable.tableNumber} tarafından ikram! ${treat.note ? `Not: ${treat.note}` : ''}`,
                            confirmedAt: new Date(),
                            orderItems: {
                                create: {
                                    menuItemId: treat.menuItemId,
                                    itemName: treat.menuItem.name,
                                    quantity: 1,
                                    unitPrice: 0,
                                    subtotal: 0
                                }
                            }
                        },
                        include: {
                            orderItems: true,
                            table: { select: { tableNumber: true, tableName: true } }
                        }
                    });

                    // Notify Kitchen via Socket
                    if (io) {
                        io.to(`restaurant_${treat.toTable.restaurantId}`).emit('new_order', newOrder);
                        logger.info(`Treat approved, created order #${newOrder.orderNumber}`);
                    }
                } catch (err) {
                    logger.error('Error creating order for treat:', err);
                    // Don't fail the request, but log it. 
                    // Ideally we might want to revert the approval or retry.
                }
            }

            // Notify update (for Admin UI etc)
            if (io) {
                io.emit('treat_status_updated', treat);
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

const prisma = require('../config/database');
const Joi = require('joi');

// Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Generate order number: ORD-YYYYMMDD-XXX
const generateOrderNumber = async (restaurantId) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const count = await prisma.order.count({
        where: {
            restaurantId,
            createdAt: {
                gte: new Date(today.setHours(0, 0, 0, 0))
            }
        }
    });

    return `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
};

const orderItemSchema = Joi.object({
    menuItemId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(99).required(),
    notes: Joi.string().max(500).optional().allow('')
});

const createOrderSchema = Joi.object({
    sessionToken: Joi.string().required(),
    items: Joi.array().items(orderItemSchema).min(1).max(50).required(),
    paymentMethod: Joi.string().valid('cash', 'card_at_table').required(),
    customerNotes: Joi.string().max(1000).optional().allow(''),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional()
});

exports.getMenuByQR = async (req, res, next) => {
    try {
        const table = await prisma.table.findUnique({
            where: { qrCode: req.params.tableQR },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        latitude: true,
                        longitude: true,
                        locationRadius: true,
                        sessionTimeout: true
                    }
                }
            }
        });

        if (!table) {
            return res.status(404).json({ error: 'Geçersiz QR kod' });
        }

        if (!table.isActive || !table.restaurant) {
            return res.status(403).json({ error: 'Bu masa aktif değil' });
        }

        // Get categories with menu items
        const categories = await prisma.category.findMany({
            where: {
                restaurantId: table.restaurant.id,
                isActive: true
            },
            include: {
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: { displayOrder: 'asc' }
                }
            },
            orderBy: { displayOrder: 'asc' }
        });

        // Get featured items
        const featuredItems = await prisma.menuItem.findMany({
            where: {
                restaurantId: table.restaurant.id,
                isAvailable: true,
                isFeatured: true
            },
            take: 10
        });

        res.json({
            restaurant: table.restaurant,
            table: {
                id: table.id,
                tableNumber: table.tableNumber,
                tableName: table.tableName
            },
            categories,
            featuredItems
        });
    } catch (error) {
        next(error);
    }
};

exports.getRestaurantBySlug = async (req, res, next) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: req.params.slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                address: true,
                phone: true
            }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restoran bulunamadı' });
        }

        res.json({ restaurant });
    } catch (error) {
        next(error);
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            throw error;
        }

        // Verify session
        const session = await prisma.session.findUnique({
            where: { sessionToken: value.sessionToken },
            include: {
                table: true,
                restaurant: {
                    select: { id: true, latitude: true, longitude: true, locationRadius: true }
                }
            }
        });

        if (!session || !session.isActive || session.expiresAt < new Date()) {
            return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
        }

        // Verify location if provided (skip in development)
        const isDev = process.env.NODE_ENV === 'development';
        if (value.latitude && value.longitude && !isDev) {
            const distance = calculateDistance(
                value.latitude, value.longitude,
                parseFloat(session.restaurant.latitude),
                parseFloat(session.restaurant.longitude)
            );

            if (distance > session.restaurant.locationRadius) {
                return res.status(403).json({ error: 'Sipariş vermek için restoranda olmalısınız' });
            }
        }

        // Get menu items and calculate total
        const menuItemIds = value.items.map(i => i.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: {
                id: { in: menuItemIds },
                restaurantId: session.restaurant.id,
                isAvailable: true
            }
        });

        if (menuItems.length !== menuItemIds.length) {
            return res.status(400).json({ error: 'Bazı ürünler mevcut değil' });
        }

        // Calculate order items and total
        const orderItems = value.items.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            const subtotal = parseFloat(menuItem.price) * item.quantity;
            return {
                menuItemId: item.menuItemId,
                itemName: menuItem.name,
                quantity: item.quantity,
                unitPrice: menuItem.price,
                subtotal,
                notes: item.notes || null
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        // Generate order number
        const orderNumber = await generateOrderNumber(session.restaurant.id);

        // Create order with items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                restaurantId: session.restaurant.id,
                tableId: session.table.id,
                sessionId: session.id,
                tableNumber: session.table.tableNumber,
                totalAmount,
                paymentMethod: value.paymentMethod,
                customerNotes: value.customerNotes || null,
                customerLatitude: value.latitude || null,
                customerLongitude: value.longitude || null,
                orderItems: {
                    create: orderItems
                }
            },
            include: {
                orderItems: true
            }
        });

        // Emit new order event (admin panel + mutfak ekranı ile uyumlu payload)
        const io = req.app.get('io');
        io.to(`restaurant_${session.restaurant.id}`).emit('new_order', {
            // Admin panelindeki Order tipi ile uyumlu alanlar
            id: order.id,
            orderNumber: order.orderNumber,
            tableId: order.tableId,
            tableNumber: order.tableNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            customerNotes: order.customerNotes,
            createdAt: order.createdAt,
            confirmedAt: order.confirmedAt,
            preparingAt: order.preparingAt,
            readyAt: order.readyAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt,
            cancellationReason: order.cancellationReason,
            orderItems: order.orderItems.map(item => ({
                id: item.id,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                notes: item.notes || undefined,
            })),
        });

        // Update session activity
        await prisma.session.update({
            where: { id: session.id },
            data: { lastActivityAt: new Date() }
        });

        res.status(201).json({
            message: 'Sipariş başarıyla oluşturuldu',
            order: {
                orderNumber: order.orderNumber,
                tableNumber: order.tableNumber,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                items: order.orderItems
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderStatus = async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.orderNumber },
            include: {
                orderItems: true,
                restaurant: { select: { name: true } }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        res.json({
            order: {
                orderNumber: order.orderNumber,
                status: order.status,
                tableNumber: order.tableNumber,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                confirmedAt: order.confirmedAt,
                preparingAt: order.preparingAt,
                readyAt: order.readyAt,
                completedAt: order.completedAt,
                items: order.orderItems,
                restaurant: order.restaurant.name
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyLocation = async (req, res, next) => {
    try {
        const { qrCode, latitude, longitude } = req.body;

        if (!qrCode || !latitude || !longitude) {
            return res.status(400).json({ error: 'QR kod ve konum bilgisi gerekli' });
        }

        const table = await prisma.table.findUnique({
            where: { qrCode },
            include: {
                restaurant: {
                    select: { latitude: true, longitude: true, locationRadius: true }
                }
            }
        });

        if (!table) {
            return res.status(404).json({ error: 'Geçersiz QR kod' });
        }

        const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(table.restaurant.latitude),
            parseFloat(table.restaurant.longitude)
        );

        const isValid = distance <= table.restaurant.locationRadius;

        res.json({
            valid: isValid,
            distance: Math.round(distance),
            maxDistance: table.restaurant.locationRadius
        });
    } catch (error) {
        next(error);
    }
};

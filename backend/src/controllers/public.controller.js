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
                        sessionTimeout: true,
                        themeSettings: true
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

// Demo menü verisi - veritabanına bağımlı değil, statik demo data döndürür
exports.getDemoMenu = async (req, res, next) => {
    try {
        const demoData = {
            restaurant: {
                id: 0,
                name: 'QResto Demo Restoran',
                slug: 'demo-restaurant',
                logoUrl: null,
                latitude: 41.0082,
                longitude: 28.9784,
                locationRadius: 99999, // Demo: lokasyon kontrolü devre dışı
                sessionTimeout: 30,
                themeSettings: {
                    primaryColor: '#f97316',
                    secondaryColor: '#ef4444',
                    fontFamily: 'Inter',
                    borderRadius: 12,
                }
            },
            table: {
                id: 0,
                tableNumber: 'DEMO-1',
                tableName: 'Demo Masa'
            },
            categories: [
                {
                    id: 1,
                    name: 'Başlangıçlar',
                    nameEn: 'Starters',
                    icon: '🥗',
                    displayOrder: 1,
                    isActive: true,
                    menuItems: [
                        {
                            id: 1,
                            name: 'Mercimek Çorbası',
                            nameEn: 'Lentil Soup',
                            description: 'Geleneksel Türk mercimek çorbası, taze limon ve kızarmış ekmek ile servis edilir.',
                            descriptionEn: 'Traditional Turkish lentil soup, served with fresh lemon and toasted bread.',
                            price: 65,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: [],
                            dietaryInfo: ['vegan'],
                            preparationTime: 5,
                            displayOrder: 1,
                        },
                        {
                            id: 2,
                            name: 'Humus Tabağı',
                            nameEn: 'Hummus Plate',
                            description: 'Nohut püresi, zeytinyağı, kırmızı biber ve pide ile.',
                            descriptionEn: 'Chickpea puree with olive oil, red pepper, served with pita.',
                            price: 55,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['gluten'],
                            dietaryInfo: ['vegan'],
                            preparationTime: 5,
                            displayOrder: 2,
                        },
                        {
                            id: 3,
                            name: 'Sigara Böreği (4 adet)',
                            nameEn: 'Cheese Rolls (4 pcs)',
                            description: 'Çıtır yufka içinde beyaz peynir, maydanoz. Altın sarısı kızartılmış.',
                            descriptionEn: 'Crispy filo pastry filled with white cheese and parsley. Golden fried.',
                            price: 75,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['gluten', 'dairy'],
                            dietaryInfo: [],
                            preparationTime: 8,
                            displayOrder: 3,
                        },
                    ]
                },
                {
                    id: 2,
                    name: 'Ana Yemekler',
                    nameEn: 'Main Courses',
                    icon: '🍖',
                    displayOrder: 2,
                    isActive: true,
                    menuItems: [
                        {
                            id: 4,
                            name: 'Izgara Köfte',
                            nameEn: 'Grilled Meatballs',
                            description: 'El yapımı dana köfte, pilav, közlenmiş biber ve domates ile.',
                            descriptionEn: 'Handmade beef meatballs with rice, grilled pepper and tomato.',
                            price: 185,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: ['gluten'],
                            dietaryInfo: [],
                            preparationTime: 15,
                            displayOrder: 1,
                        },
                        {
                            id: 5,
                            name: 'Tavuk Şiş',
                            nameEn: 'Chicken Skewers',
                            description: 'Özel soslu marine tavuk, lavaş, közlenmiş sebzeler ve yoğurt ile.',
                            descriptionEn: 'Marinated chicken with special sauce, flatbread, grilled vegetables and yogurt.',
                            price: 165,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: ['dairy'],
                            dietaryInfo: [],
                            preparationTime: 18,
                            displayOrder: 2,
                        },
                        {
                            id: 6,
                            name: 'Karışık Izgara',
                            nameEn: 'Mixed Grill',
                            description: 'Adana, kuşbaşı, pirzola ve kanat. Pilav, salata ve közlenmiş sebze ile.',
                            descriptionEn: 'Adana kebab, cubed meat, chops and wings. With rice, salad and grilled vegetables.',
                            price: 320,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: [],
                            dietaryInfo: [],
                            preparationTime: 25,
                            displayOrder: 3,
                        },
                        {
                            id: 7,
                            name: 'Falafel Tabağı',
                            nameEn: 'Falafel Plate',
                            description: 'Nohut köftesi, tahin sos, taze salata ve pide ekmek ile.',
                            descriptionEn: 'Chickpea falafel with tahini sauce, fresh salad and pita bread.',
                            price: 135,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['gluten'],
                            dietaryInfo: ['vegan'],
                            preparationTime: 12,
                            displayOrder: 4,
                        },
                    ]
                },
                {
                    id: 3,
                    name: 'İçecekler',
                    nameEn: 'Beverages',
                    icon: '🥤',
                    displayOrder: 3,
                    isActive: true,
                    menuItems: [
                        {
                            id: 8,
                            name: 'Taze Limonata',
                            nameEn: 'Fresh Lemonade',
                            description: 'Ev yapımı taze sıkılmış limonata, nane ile.',
                            descriptionEn: 'Homemade fresh-squeezed lemonade with mint.',
                            price: 45,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: [],
                            dietaryInfo: ['vegan'],
                            preparationTime: 3,
                            displayOrder: 1,
                        },
                        {
                            id: 9,
                            name: 'Türk Çayı',
                            nameEn: 'Turkish Tea',
                            description: 'Geleneksel ince belli bardakta demlenmiş çay.',
                            descriptionEn: 'Traditional brewed tea in a slim glass.',
                            price: 20,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: [],
                            dietaryInfo: ['vegan'],
                            preparationTime: 3,
                            displayOrder: 2,
                        },
                        {
                            id: 10,
                            name: 'Türk Kahvesi',
                            nameEn: 'Turkish Coffee',
                            description: 'Geleneksel cezve usulü, lokum ile servis edilir.',
                            descriptionEn: 'Traditional cezve-brewed coffee, served with Turkish delight.',
                            price: 50,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: [],
                            dietaryInfo: ['vegan'],
                            preparationTime: 5,
                            displayOrder: 3,
                        },
                        {
                            id: 11,
                            name: 'Ayran',
                            nameEn: 'Ayran (Yogurt Drink)',
                            description: 'Geleneksel köpüklü ayran.',
                            descriptionEn: 'Traditional frothy yogurt drink.',
                            price: 25,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['dairy'],
                            dietaryInfo: [],
                            preparationTime: 1,
                            displayOrder: 4,
                        },
                    ]
                },
                {
                    id: 4,
                    name: 'Tatlılar',
                    nameEn: 'Desserts',
                    icon: '🍰',
                    displayOrder: 4,
                    isActive: true,
                    menuItems: [
                        {
                            id: 12,
                            name: 'Künefe',
                            nameEn: 'Kunefe',
                            description: 'Sıcak tel kadayıf arası peynir, antep fıstığı ve şerbet ile.',
                            descriptionEn: 'Hot shredded pastry with cheese, pistachio and syrup.',
                            price: 95,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: true,
                            allergens: ['dairy', 'nuts', 'gluten'],
                            dietaryInfo: [],
                            preparationTime: 12,
                            displayOrder: 1,
                        },
                        {
                            id: 13,
                            name: 'Sütlaç',
                            nameEn: 'Rice Pudding',
                            description: 'Fırında kızarmış geleneksel sütlaç.',
                            descriptionEn: 'Traditional oven-baked rice pudding.',
                            price: 65,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['dairy', 'gluten'],
                            dietaryInfo: [],
                            preparationTime: 2,
                            displayOrder: 2,
                        },
                        {
                            id: 14,
                            name: 'Baklava (4 dilim)',
                            nameEn: 'Baklava (4 slices)',
                            description: 'Antep fıstıklı geleneksel baklava.',
                            descriptionEn: 'Traditional pistachio baklava.',
                            price: 110,
                            imageUrl: null,
                            isAvailable: true,
                            isFeatured: false,
                            allergens: ['nuts', 'gluten', 'dairy'],
                            dietaryInfo: [],
                            preparationTime: 2,
                            displayOrder: 3,
                        },
                    ]
                }
            ],
            featuredItems: [],
            isDemo: true,
        };

        // Featured items: tüm kategorilerden isFeatured olanları topla
        demoData.featuredItems = demoData.categories
            .flatMap(c => c.menuItems)
            .filter(item => item.isFeatured);

        res.json(demoData);
    } catch (error) {
        next(error);
    }
};

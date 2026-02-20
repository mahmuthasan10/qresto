const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// DEBUG: Test data endpoint
router.get('/debug/test-data', async (req, res, next) => {
    try {
        const prisma = require('../config/database');
        const restaurants = await prisma.restaurant.findMany({ take: 5 });
        const tables = await prisma.table.findMany({ take: 5 });
        const qrCodes = tables.map(t => ({ tableNumber: t.tableNumber, qrCode: t.qrCode }));
        res.json({ restaurants: restaurants.length, tables: tables.length, qrCodes });
    } catch (err) {
        next(err);
    }
});

// DEBUG: Create test data (GeliştirmeOnly)
router.post('/debug/seed-test', async (req, res, next) => {
    try {
        const prisma = require('../config/database');
        
        // Kontrol: Varsa yeni oluşturma
        let restaurant = await prisma.restaurant.findFirst({
            where: { name: 'Test Restaurant' }
        });

        if (!restaurant) {
            restaurant = await prisma.restaurant.create({
                data: {
                    name: 'Test Restaurant',
                    slug: 'test-restaurant',
                    email: 'test@restaurant.local',
                    passwordHash: '$2b$10$test', // Dummy hash
                    latitude: 41.0082,
                    longitude: 28.9784,
                    locationRadius: 50,
                    sessionTimeout: 30,
                    isActive: true
                }
            });
        }

        // Kategori
        let category = await prisma.category.findFirst({
            where: { restaurantId: restaurant.id, name: 'Başlangıçlar' }
        });

        if (!category) {
            category = await prisma.category.create({
                data: {
                    restaurantId: restaurant.id,
                    name: 'Başlangıçlar',
                    icon: '🥗',
                    isActive: true
                }
            });
        }

        // Menu Items
        const item = await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: category.id,
                name: 'Ev Salatası',
                price: 35,
                description: 'Taze sebzelerden yapılmış leziz salata',
                isAvailable: true,
                isFeatured: true
            }
        });

        // Tablo
        let table = await prisma.table.findFirst({
            where: { restaurantId: restaurant.id, tableNumber: 'TEST-1' }
        });

        if (!table) {
            table = await prisma.table.create({
                data: {
                    restaurantId: restaurant.id,
                    tableNumber: 'TEST-1',
                    tableName: 'Test Masası',
                    qrCode: 'test-qr-123',
                    capacity: 4,
                    isActive: true
                }
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.json({ 
            message: 'Test verisi oluşturuldu!',
            testUrl: `${frontendUrl}/menu/test-qr-123`
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/public/menu/:tableQR - QR ile menü görüntüleme
router.get('/menu/:tableQR', publicController.getMenuByQR);

// GET /api/v1/public/restaurant/:slug - Restaurant bilgisi
router.get('/restaurant/:slug', publicController.getRestaurantBySlug);

// POST /api/v1/public/orders - Müşteri sipariş oluşturma
router.post('/orders', publicController.createOrder);

// GET /api/v1/public/orders/:orderNumber - Sipariş takibi
router.get('/orders/:orderNumber', publicController.getOrderStatus);

// POST /api/v1/public/location/verify - Lokasyon doğrulama
router.post('/location/verify', publicController.verifyLocation);

// GET /api/v1/public/demo/menu - Demo menü verisi (statik)
router.get('/demo/menu', publicController.getDemoMenu);

module.exports = router;

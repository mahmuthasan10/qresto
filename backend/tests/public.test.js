const request = require('supertest');
const { app } = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Public Endpoints', () => {
    let restaurantId;
    let restaurantSlug;

    beforeAll(async () => {
        // Create a dummy restaurant for testing
        const restaurant = await prisma.restaurant.create({
            data: {
                name: 'Test Public Resto',
                slug: `test-public-${Date.now()}`,
                email: `test_public_${Date.now()}@example.com`,
                passwordHash: 'hash',
                phone: '1234567890',
                latitude: 41.0,
                longitude: 29.0
            }
        });
        restaurantId = restaurant.id;
        restaurantSlug = restaurant.slug;

        // Create a category and item
        const category = await prisma.category.create({
            data: {
                restaurantId,
                name: 'Test Category',
                displayOrder: 1
            }
        });

        await prisma.menuItem.create({
            data: {
                restaurantId,
                categoryId: category.id,
                name: 'Test Item',
                price: 100,
                description: 'Delicious test item',
                isAvailable: true
            }
        });
    });

    afterAll(async () => {
        // Clean up
        await prisma.menuItem.deleteMany({ where: { restaurantId } });
        await prisma.category.deleteMany({ where: { restaurantId } });
        await prisma.table.deleteMany({ where: { restaurantId } }); // Create table below, need to clean
        await prisma.restaurant.delete({ where: { id: restaurantId } });
        await prisma.$disconnect();
    });

    it('should get restaurant details by slug', async () => {
        const res = await request(app).get(`/api/v1/public/restaurant/${restaurantSlug}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.restaurant).toHaveProperty('name', 'Test Public Resto');
    });

    it('should get menu by QR code', async () => {
        // Create a table with QR code
        const table = await prisma.table.create({
            data: {
                restaurantId,
                tableNumber: 'T1',
                qrCode: `test-qr-${Date.now()}`,
                isActive: true
            }
        });

        const res = await request(app).get(`/api/v1/public/menu/${table.qrCode}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('restaurant');
        expect(res.body).toHaveProperty('categories');
        expect(res.body.categories.length).toBeGreaterThan(0);
        expect(res.body.categories[0].menuItems[0]).toHaveProperty('name', 'Test Item');
    });
});

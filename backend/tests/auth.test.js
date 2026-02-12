const request = require('supertest');
const { app } = require('../src/index'); // Make sure app is exported from src/index.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
    let testUser = {
        name: 'Test Restaurant',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890',
        latitude: 41.0,
        longitude: 29.0
    };

    afterAll(async () => {
        // Clean up test user
        await prisma.restaurant.deleteMany({
            where: { email: testUser.email }
        });
        await prisma.$disconnect();
    });

    it('should register a new restaurant', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.restaurant).toHaveProperty('email', testUser.email);
    });

    it('should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail to login with invalid password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});

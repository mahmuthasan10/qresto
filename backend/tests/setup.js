const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
});

afterAll(async () => {
    // Disconnect
    await prisma.$disconnect();
}); // Increase timeout for slower environments
jest.setTimeout(30000);

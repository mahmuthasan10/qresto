const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        },
    },
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
});

// Prisma Decimal alanlarını otomatik Number'a çevir (JSON serialization sorunu)
const prisma = basePrisma.$extends({
    result: {
        order: {
            totalAmount: {
                needs: { totalAmount: true },
                compute(order) { return Number(order.totalAmount); }
            }
        },
        orderItem: {
            unitPrice: {
                needs: { unitPrice: true },
                compute(item) { return Number(item.unitPrice); }
            },
            subtotal: {
                needs: { subtotal: true },
                compute(item) { return Number(item.subtotal); }
            }
        },
        menuItem: {
            price: {
                needs: { price: true },
                compute(item) { return Number(item.price); }
            }
        }
    }
});

module.exports = prisma;

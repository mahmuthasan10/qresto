require('dotenv').config();
const prisma = require('./src/config/database');

async function checkStats() {
    try {
        const orderCount = await prisma.order.count();
        const treatCount = await prisma.treat.count();
        const tableCount = await prisma.table.count();
        const sessionCount = await prisma.session.count();
        const categoryCount = await prisma.category.count();
        const productCount = await prisma.menuItem.count();

        console.log('--- DATABASE STATS ---');
        console.log(`Orders: ${orderCount}`);
        console.log(`Treats: ${treatCount}`);
        console.log(`Tables: ${tableCount}`);
        console.log(`Sessions: ${sessionCount}`);
        console.log(`Categories: ${categoryCount}`);
        console.log(`Products: ${productCount}`);
        console.log('----------------------');
    } catch (error) {
        console.error('Error checking stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStats();

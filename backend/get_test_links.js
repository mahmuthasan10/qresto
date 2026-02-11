require('dotenv').config();
const prisma = require('./src/config/database');

async function getLinks() {
    try {
        const table = await prisma.table.findFirst({
            where: { isActive: true },
            include: { restaurant: true }
        });

        console.log('--- TEST LINKS ---');
        if (table) {
            console.log(`Customer Menu (Masa ${table.tableNumber}): http://localhost:3000/menu/${table.qrCode}`);
        } else {
            console.log('No active table found! Please check database seed.');
        }

        console.log('Admin Panel: http://localhost:3000/admin/login');
        console.log('Kitchen Screen: http://localhost:3000/kitchen');

        const restaurant = await prisma.restaurant.findFirst();
        if (restaurant) {
            console.log(`\n--- CREDENTIALS ---`);
            console.log(`Admin Email: ${restaurant.email}`);
            console.log(`Password: (Use the one defined in seed, usually '123456')`);
        }
    } catch (error) {
        console.error('Error retrieving links:', error);
    } finally {
        await prisma.$disconnect();
    }
}

getLinks();

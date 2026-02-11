require('dotenv').config();
const prisma = require('./src/config/database');

async function cleanData() {
    console.log('Starting data cleanup...');
    try {
        // 1. Order Items (Child of Order)
        const deletedOrderItems = await prisma.orderItem.deleteMany({});
        console.log(`✓ Deleted ${deletedOrderItems.count} OrderItems`);

        // 2. Orders (Child of Restaurant, Table, Session)
        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`✓ Deleted ${deletedOrders.count} Orders`);

        // 3. Treats (Child of Restaurant, Table, MenuItem)
        const deletedTreats = await prisma.treat.deleteMany({});
        console.log(`✓ Deleted ${deletedTreats.count} Treats`);

        // 4. Sessions (Child of Table)
        const deletedSessions = await prisma.session.deleteMany({});
        console.log(`✓ Deleted ${deletedSessions.count} Sessions`);

        // 5. Reset Table Statuses to Active/Available if needed
        // Assuming 'isActive' is for soft delete, not occupancy.
        // If there's an 'isOccupied' field, we should reset it.
        // Based on previous files, Table has 'isActive'. checking schema will confirm.

        console.log('✓ Transactional data cleaned successfully.');
    } catch (error) {
        console.error('❌ Error cleaning data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanData();

const prisma = require('./src/config/database');

async function main() {
    try {
        console.log('Checking prisma.restaurant:', typeof prisma.restaurant);
        if (!prisma.restaurant) throw new Error('prisma.restaurant is undefined');

        console.log('Connecting...');
        const count = await prisma.restaurant.count();
        console.log('Restaurant count:', count);
    } catch (e) {
        console.error('ERROR OCCURRED:');
        console.error(e.message);
        if (e.meta) console.error('Meta:', e.meta);
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

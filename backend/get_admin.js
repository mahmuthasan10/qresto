require('dotenv').config();
const prisma = require('./src/config/database');

async function run() {
    try {
        const admin = await prisma.restaurant.findFirst();
        console.log('ADMIN_EMAIL:' + (admin ? admin.email : 'NONE'));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();

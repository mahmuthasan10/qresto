require('dotenv').config();
const prisma = require('./src/config/database');

async function run() {
    try {
        const t = await prisma.table.findFirst({ where: { isActive: true } });
        console.log('QRCODE:' + (t ? t.qrCode : 'NONE'));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();

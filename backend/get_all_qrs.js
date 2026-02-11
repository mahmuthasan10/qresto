const prisma = require('./src/config/database');
const fs = require('fs');

async function main() {
    try {
        const total = await prisma.table.count();
        console.log(`Total tables: ${total}`);

        const tables = await prisma.table.findMany({
            take: 5
        });

        const output = tables.map(t => `Masa ${t.tableNumber} (Active: ${t.isActive}) | QR: ${t.qrCode}`).join('\n');
        fs.writeFileSync('active_qrs.txt', output || 'NO TABLES FOUND');
        console.log('Done');
    } catch (e) {
        console.error(e);
        fs.writeFileSync('active_qrs.txt', 'ERROR: ' + e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

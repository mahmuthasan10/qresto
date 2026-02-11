const prisma = require('./src/config/database');

async function main() {
    try {
        const count = await prisma.table.count({ where: { isActive: true } });
        console.log(`Initial Count: ${count}`);

        const tables = await prisma.table.findMany({
            where: { isActive: true },
            take: 3,
            select: { tableNumber: true, qrCode: true }
        });

        console.log('--- ACTIVE TABLES ---');
        tables.forEach(t => {
            console.log(`Masa ${t.tableNumber} | QR: ${t.qrCode}`);
        });
        console.log('---------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

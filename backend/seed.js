const prisma = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding database...');

    // 1. Create Restaurant
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const restaurant = await prisma.restaurant.upsert({
        where: { email: 'admin@qresto.com' },
        update: {},
        create: {
            name: 'QResto Demo',
            slug: 'qresto-demo',
            email: 'admin@qresto.com',
            passwordHash: hashedPassword,
            latitude: 41.0082,
            longitude: 28.9784,
            isActive: true
        }
    });

    console.log(`Restaurant created: ${restaurant.name}`);

    // 2. Create Category
    const category = await prisma.category.create({
        data: {
            restaurantId: restaurant.id,
            name: 'İçecekler',
            displayOrder: 1
        }
    });

    // 3. Create Menu Items
    await prisma.menuItem.createMany({
        data: [
            {
                restaurantId: restaurant.id,
                categoryId: category.id,
                name: 'Çay',
                price: 15.00,
                description: 'Taze demlenmiş çay',
                isAvailable: true
            },
            {
                restaurantId: restaurant.id,
                categoryId: category.id,
                name: 'Kahve',
                price: 45.00,
                description: 'Türk kahvesi',
                isAvailable: true
            }
        ]
    });

    // 4. Create Tables
    const tablesData = [
        { tableNumber: '1', qrCode: 'qr_code_table_1_' + Date.now() },
        { tableNumber: '2', qrCode: 'qr_code_table_2_' + Date.now() },
        { tableNumber: '3', qrCode: 'qr_code_table_3_' + Date.now() },
    ];

    for (const t of tablesData) {
        await prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                tableNumber: t.tableNumber,
                qrCode: t.qrCode,
                isActive: true
            }
        });
        console.log(`Table ${t.tableNumber} created. QR: ${t.qrCode}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

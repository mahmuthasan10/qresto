const prisma = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        console.log('Script started');
        const email = 'demo@qresto.com';
        const password = 'demo123';

        // Check if user exists
        console.log('Checking for existing user...');
        const existing = await prisma.restaurant.findUnique({ where: { email } });

        if (existing) {
            console.log('User already exists. Updating password...');
            const hash = await bcrypt.hash(password, 12);
            await prisma.restaurant.update({
                where: { email },
                data: { passwordHash: hash, isActive: true }
            });
            console.log('SUCCESS: Password updated.');
        } else {
            console.log('Creating new user...');
            const hash = await bcrypt.hash(password, 12);
            await prisma.restaurant.create({
                data: {
                    name: 'Demo Restaurant',
                    slug: 'demo-restaurant',
                    email,
                    passwordHash: hash,
                    phone: '5551234567',
                    latitude: 41.0082,
                    longitude: 28.9784
                }
            });
            console.log('SUCCESS: User created.');
        }
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
        console.log('Script finished');
    }
}

main();

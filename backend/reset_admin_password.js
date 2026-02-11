require('dotenv').config();
const prisma = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const email = 'teknofest@qresto.com'; // Or fetch the first one found
    const newPassword = '123456';

    try {
        const restaurant = await prisma.restaurant.findFirst();
        if (!restaurant) {
            console.log('No restaurant found to update.');
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { passwordHash: hashedPassword }
        });

        console.log(`Password for ${restaurant.email} has been reset to: ${newPassword}`);
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();

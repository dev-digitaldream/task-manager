// Script to create a test user with hashed password
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('Demo2024!', 12);
        
        // Check if demo user exists
        const existingUser = await prisma.user.findFirst({
            where: { email: 'demo@digitaldream.work' }
        });

        if (existingUser) {
            // Update existing user with password
            const updated = await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                    password: hashedPassword,
                    email: 'demo@digitaldream.work',
                    emailVerified: true
                }
            });
            console.log('✅ Demo user password updated:', updated.email);
        } else {
            // Create new demo user
            const user = await prisma.user.create({
                data: {
                    name: 'Demo User',
                    email: 'demo@digitaldream.work',
                    password: hashedPassword,
                    avatar: '👤',
                    emailVerified: true
                }
            });
            console.log('✅ Demo user created:', user.email);
        }

        // Create admin user
        const adminPassword = await bcrypt.hash('Admin2024!', 12);
        const existingAdmin = await prisma.user.findFirst({
            where: { email: 'admin@digitaldream.work' }
        });

        if (existingAdmin) {
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { 
                    password: adminPassword,
                    isAdmin: true,
                    emailVerified: true
                }
            });
            console.log('✅ Admin user password updated');
        } else {
            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: 'admin@digitaldream.work',
                    password: adminPassword,
                    avatar: '👑',
                    isAdmin: true,
                    emailVerified: true
                }
            });
            console.log('✅ Admin user created');
        }

        console.log('\n📧 Test Credentials:');
        console.log('   Demo: demo@digitaldream.work / Demo2024!');
        console.log('   Admin: admin@digitaldream.work / Admin2024!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();

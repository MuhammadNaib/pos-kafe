import prisma from '../src/lib/prisma.js';
import { hashPassword } from '../src/utils/password.js';

const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();

const user = await prisma.user.update({
    where: { email },
    data: { password: await hashPassword(process.env.SEED_ADMIN_PASSWORD) },
});

console.log(`Password untuk ${user.email} sudah diperbarui sesuai .env`);
await prisma.$disconnect();
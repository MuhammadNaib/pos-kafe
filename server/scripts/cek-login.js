import prisma from '../src/lib/prisma.js';
import { verifyPassword } from '../src/utils/password.js';

const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
const passwordEnv = process.env.SEED_ADMIN_PASSWORD;
const user = await prisma.user.findUnique({ where: { email } });

console.log('Panjang password di .env :', passwordEnv.length, 'karakter');
console.log('Sama persis dengan admin123:', passwordEnv === 'admin123');
console.log('Hash cocok dengan .env    :', await verifyPassword(passwordEnv, user.password));
console.log('Hash cocok dengan admin123:', await verifyPassword('admin123', user.password));

await prisma.$disconnect();
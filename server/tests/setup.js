import { beforeEach, afterAll } from 'vitest';
import prisma from '../src/lib/prisma.js';

if (!process.env.DATABASE_URL?.includes('pos_kafe_test')) {
    throw new Error('Tes harus memakai database pos_kafe_test. Cek file .env.test');
}

beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});
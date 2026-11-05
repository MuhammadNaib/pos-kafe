import prisma from '../../src/lib/prisma.js';
import { hashPassword } from '../../src/utils/password.js';

export async function createUser(overrides = {}) {
    const { password = 'rahasia123', ...rest } = overrides;

    return prisma.user.create({
        data: {
            name: 'Admin Kafe',
            email: 'admin@kafe.com',
            role: 'ADMIN',
            ...rest,
            password: await hashPassword(password),
        },
    });
}
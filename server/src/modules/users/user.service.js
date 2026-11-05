import prisma from '../../lib/prisma.js';
import HttpError from '../../utils/HttpError.js';
import { hashPassword } from '../../utils/password.js';

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
};

export function listUsers() {
    return prisma.user.findMany({ orderBy: { name: 'asc' }, select: userSelect });
}

export async function createUser({ password, ...data }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
        throw new HttpError(409, 'Email sudah dipakai');
    }

    return prisma.user.create({
        data: { ...data, password: await hashPassword(password) },
        select: userSelect,
    });
}

export async function updateUser(id, { password, ...data }, currentUserId) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
        throw new HttpError(404, 'User tidak ditemukan');
    }

    const menguncDiriSendiri =
        id === currentUserId && (data.isActive === false || data.role === 'CASHIER');

    if (menguncDiriSendiri) {
        throw new HttpError(409, 'Anda tidak bisa menonaktifkan atau menurunkan peran akun sendiri');
    }

    if (password !== undefined) {
        data.password = await hashPassword(password);
    }

    return prisma.user.update({ where: { id }, data, select: userSelect });
}
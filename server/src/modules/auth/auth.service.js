import prisma from '../../lib/prisma.js';
import HttpError from '../../utils/HttpError.js';
import { verifyPassword } from '../../utils/password.js';

export async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordBenar = user ? await verifyPassword(password, user.password) : false;
    console.log('[login]', { email, userDitemukan: Boolean(user), passwordBenar });

    if (!passwordBenar) {
        throw new HttpError(401, 'Email atau password salah');
    }

    if (!user.isActive) {
        throw new HttpError(403, 'Akun Anda dinonaktifkan. Hubungi pemilik kafe.');
    }

    return { id: user.id, name: user.name, email: user.email, role: user.role };
}
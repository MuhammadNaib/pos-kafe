import prisma from '../lib/prisma.js';
import HttpError from '../utils/HttpError.js';
import { verifyToken } from '../utils/token.js';

export async function requireAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        throw new HttpError(401, 'Silakan login terlebih dahulu');
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        throw new HttpError(401, 'Sesi berakhir, silakan login kembali');
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(payload.sub) },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
        throw new HttpError(401, 'Sesi berakhir, silakan login kembali');
    }

    const { isActive, ...publicUser } = user;
    req.user = publicUser;
    next();
}

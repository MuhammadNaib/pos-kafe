import jwt from 'jsonwebtoken';

export const SESSION_MS = 12 * 60 * 60 * 1000;

export function signToken(userId) {
    return jwt.sign({}, process.env.JWT_SECRET, {
        subject: String(userId),
        expiresIn: SESSION_MS / 1000,
    });
}

export function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}
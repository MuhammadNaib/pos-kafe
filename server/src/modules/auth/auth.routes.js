import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import validate from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/auth.js';
import { signToken, SESSION_MS } from '../../utils/token.js';
import { loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' });
    },
});

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
    const user = await authService.login(req.body);
    res.cookie('token', signToken(user.id), { ...COOKIE_OPTIONS, maxAge: SESSION_MS });
    res.json(user);
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
    res.json(req.user);
});

export default router;
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { loginAs } from './helpers/agent.js';

describe('Tanpa login', () => {
    it.each([
        ['GET', '/api/categories'],
        ['GET', '/api/menus'],
        ['GET', '/api/menus/1'],
        ['POST', '/api/categories'],
        ['POST', '/api/menus'],
        ['POST', '/api/uploads'],
    ])('%s %s ditolak dengan 401', async (method, url) => {
        const res = await request(app)[method.toLowerCase()](url);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Silakan login terlebih dahulu' });
    });
});

describe('Sebagai kasir', () => {
    let kasir;

    beforeEach(async () => {
        kasir = await loginAs('CASHIER');
    });

    it.each(['/api/categories', '/api/menus'])('boleh melihat %s', async (url) => {
        const res = await kasir.get(url);

        expect(res.status).toBe(200);
    });

    it.each([
        ['POST', '/api/categories'],
        ['PUT', '/api/categories/1'],
        ['DELETE', '/api/categories/1'],
        ['POST', '/api/menus'],
        ['PUT', '/api/menus/1'],
        ['DELETE', '/api/menus/1'],
        ['POST', '/api/uploads'],
    ])('%s %s ditolak dengan 403', async (method, url) => {
        const res = await kasir[method.toLowerCase()](url);

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ message: 'Anda tidak memiliki akses ke fitur ini' });
    });
});

describe('User yang dinonaktifkan', () => {
    it('langsung kehilangan akses walaupun cookie-nya masih ada', async () => {
        const kasir = await loginAs('CASHIER');
        await prisma.user.updateMany({ where: { role: 'CASHIER' }, data: { isActive: false } });

        const res = await kasir.get('/api/menus');

        expect(res.status).toBe(401);
    });
});
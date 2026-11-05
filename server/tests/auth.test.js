import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './helpers/users.js';

const LOGIN_ADMIN = { email: 'admin@kafe.com', password: 'rahasia123' };

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await createUser();
    });

    it('berhasil dengan email dan password yang benar', async () => {
        const res = await request(app).post('/api/auth/login').send(LOGIN_ADMIN);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: 'Admin Kafe',
            email: 'admin@kafe.com',
            role: 'ADMIN',
        });

        const cookie = res.headers['set-cookie'][0];
        expect(cookie).toMatch(/^token=/);
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Strict');
    });

    it('menolak password yang salah', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...LOGIN_ADMIN, password: 'salah1234' });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Email atau password salah' });
    });

    it('memberi pesan yang sama untuk email yang tidak terdaftar', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...LOGIN_ADMIN, email: 'tidakada@kafe.com' });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Email atau password salah' });
    });

    it('mencocokkan email tanpa memedulikan spasi dan huruf besar', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...LOGIN_ADMIN, email: '  ADMIN@Kafe.com ' });

        expect(res.status).toBe(200);
    });

    it('menolak akun yang dinonaktifkan', async () => {
        await createUser({ email: 'kasir@kafe.com', role: 'CASHIER', isActive: false });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'kasir@kafe.com', password: 'rahasia123' });

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ message: 'Akun Anda dinonaktifkan. Hubungi pemilik kafe.' });
    });

    it('menolak email kosong', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: '', password: 'x' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Email wajib diisi' });
    });
});

describe('GET /api/auth/me', () => {
    it('mengembalikan user yang sedang login', async () => {
        await createUser();
        const agent = request.agent(app);
        await agent.post('/api/auth/login').send(LOGIN_ADMIN);

        const res = await agent.get('/api/auth/me');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ email: 'admin@kafe.com', role: 'ADMIN' });
        expect(res.body.password).toBeUndefined();
    });

    it('menolak request tanpa cookie', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Silakan login terlebih dahulu' });
    });

    it('menolak token palsu', async () => {
        const res = await request(app).get('/api/auth/me').set('Cookie', 'token=palsu');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Sesi berakhir, silakan login kembali' });
    });
});

describe('POST /api/auth/logout', () => {
    it('menghapus sesi', async () => {
        await createUser();
        const agent = request.agent(app);
        await agent.post('/api/auth/login').send(LOGIN_ADMIN);

        const res = await agent.post('/api/auth/logout');
        const me = await agent.get('/api/auth/me');

        expect(res.status).toBe(204);
        expect(me.status).toBe(401);
    });
});
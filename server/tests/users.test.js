import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { loginAs } from './helpers/agent.js';
import { createUser } from './helpers/users.js';

const KASIR_BARU = {
    name: 'Budi',
    email: 'budi@kafe.com',
    password: 'kasirbudi1',
    role: 'CASHIER',
};

let api;
let admin;

beforeEach(async () => {
    api = await loginAs('ADMIN');
    admin = await prisma.user.findUnique({ where: { email: 'admin.tes@kafe.com' } });
});

function login(email, password) {
    return request(app).post('/api/auth/login').send({ email, password });
}

describe('POST /api/users', () => {
    it('membuat user baru tanpa mengembalikan password', async () => {
        const res = await api.post('/api/users').send(KASIR_BARU);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: 'Budi',
            email: 'budi@kafe.com',
            role: 'CASHIER',
            isActive: true,
            createdAt: expect.any(String),
        });
    });

    it('user baru bisa langsung login', async () => {
        await api.post('/api/users').send(KASIR_BARU);

        const res = await login('budi@kafe.com', 'kasirbudi1');

        expect(res.status).toBe(200);
    });

    it('menyimpan email dalam huruf kecil tanpa spasi', async () => {
        const res = await api.post('/api/users').send({ ...KASIR_BARU, email: '  Budi@Kafe.com ' });

        expect(res.body.email).toBe('budi@kafe.com');
    });

    it('menolak email yang sudah dipakai, walau beda huruf besar/kecil', async () => {
        await createUser({ name: 'Budi Lama', email: 'budi@kafe.com', role: 'CASHIER' });

        const res = await api.post('/api/users').send({ ...KASIR_BARU, email: 'BUDI@kafe.com' });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Email sudah dipakai' });
    });

    it('menolak format email yang salah', async () => {
        const res = await api.post('/api/users').send({ ...KASIR_BARU, email: 'budi' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Format email tidak valid' });
    });

    it('menolak password kurang dari 8 karakter', async () => {
        const res = await api.post('/api/users').send({ ...KASIR_BARU, password: 'pendek7' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Password minimal 8 karakter' });
    });

    it('menolak peran yang tidak dikenal', async () => {
        const res = await api.post('/api/users').send({ ...KASIR_BARU, role: 'BOS' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Peran harus ADMIN atau CASHIER' });
    });
});

describe('GET /api/users', () => {
    it('mengembalikan daftar user urut nama, tanpa password', async () => {
        await createUser({ name: 'Budi', email: 'budi@kafe.com', role: 'CASHIER' });

        const res = await api.get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body.map((user) => user.name)).toEqual(['Admin Tes', 'Budi']);
        expect(res.body.every((user) => user.password === undefined)).toBe(true);
    });

    it('tidak bisa diakses kasir', async () => {
        const kasir = await loginAs('CASHIER');

        const res = await kasir.get('/api/users');

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/users/:id', () => {
    let kasir;

    beforeEach(async () => {
        kasir = await createUser({ name: 'Budi', email: 'budi@kafe.com', role: 'CASHIER' });
    });

    it('mengubah nama dan peran', async () => {
        const res = await api.put(`/api/users/${kasir.id}`).send({ name: 'Budi Santoso', role: 'ADMIN' });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ name: 'Budi Santoso', role: 'ADMIN' });
    });

    it('menonaktifkan kasir sehingga tidak bisa login lagi', async () => {
        const res = await api.put(`/api/users/${kasir.id}`).send({ isActive: false });
        const loginKasir = await login('budi@kafe.com', 'rahasia123');

        expect(res.status).toBe(200);
        expect(res.body.isActive).toBe(false);
        expect(loginKasir.status).toBe(403);
    });

    it('mengganti password', async () => {
        const res = await api.put(`/api/users/${kasir.id}`).send({ password: 'passwordbaru' });
        const loginBaru = await login('budi@kafe.com', 'passwordbaru');
        const loginLama = await login('budi@kafe.com', 'rahasia123');

        expect(res.status).toBe(200);
        expect(loginBaru.status).toBe(200);
        expect(loginLama.status).toBe(401);
    });

    it('boleh mengubah nama akun sendiri', async () => {
        const res = await api.put(`/api/users/${admin.id}`).send({ name: 'Pemilik' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Pemilik');
    });

    it.each([{ isActive: false }, { role: 'CASHIER' }])(
        'menolak mengubah akun sendiri menjadi %o',
        async (perubahan) => {
            const res = await api.put(`/api/users/${admin.id}`).send(perubahan);

            expect(res.status).toBe(409);
            expect(res.body).toEqual({
                message: 'Anda tidak bisa menonaktifkan atau menurunkan peran akun sendiri',
            });
        },
    );

    it('mengembalikan 404 untuk user yang tidak ada', async () => {
        const res = await api.put('/api/users/999999').send({ name: 'Siapa' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'User tidak ditemukan' });
    });
});
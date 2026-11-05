import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../src/lib/prisma.js';
import { loginAs } from './helpers/agent.js';

let api;

beforeEach(async () => {
    api = await loginAs('ADMIN');
});

describe('POST /api/categories', () => {
    it('membuat kategori baru', async () => {
        const res = await api.post('/api/categories').send({ name: 'Kopi' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: expect.any(Number), name: 'Kopi' });
    });

    it('menolak nama kosong', async () => {
        const res = await api.post('/api/categories').send({ name: '   ' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Nama kategori wajib diisi' });
    });

    it('menolak nama yang sudah ada, walau beda huruf besar/kecil', async () => {
        await prisma.category.create({ data: { name: 'Kopi' } });

        const res = await api.post('/api/categories').send({ name: 'kopi' });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Kategori sudah ada' });
    });
});

describe('GET /api/categories', () => {
    it('mengembalikan kategori urut nama beserta jumlah menunya', async () => {
        const kopi = await prisma.category.create({ data: { name: 'Kopi' } });
        await prisma.category.create({ data: { name: 'Snack' } });
        await prisma.category.create({ data: { name: 'Makanan' } });
        await prisma.menu.create({
            data: { name: 'Americano', price: 18000, categoryId: kopi.id },
        });

        const res = await api.get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: kopi.id, name: 'Kopi', menuCount: 1 },
            { id: expect.any(Number), name: 'Makanan', menuCount: 0 },
            { id: expect.any(Number), name: 'Snack', menuCount: 0 },
        ]);
    });
});

describe('PUT /api/categories/:id', () => {
    it('mengubah nama kategori', async () => {
        const kopi = await prisma.category.create({ data: { name: 'Kopi' } });

        const res = await api.put(`/api/categories/${kopi.id}`).send({ name: 'Kopi Spesial' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: kopi.id, name: 'Kopi Spesial' });
    });

    it('boleh mengubah huruf besar/kecil nama sendiri', async () => {
        const kopi = await prisma.category.create({ data: { name: 'kopi' } });

        const res = await api.put(`/api/categories/${kopi.id}`).send({ name: 'Kopi' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Kopi');
    });

    it('menolak nama yang sudah dipakai kategori lain', async () => {
        await prisma.category.create({ data: { name: 'Snack' } });
        const kopi = await prisma.category.create({ data: { name: 'Kopi' } });

        const res = await api.put(`/api/categories/${kopi.id}`).send({ name: 'snack' });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Kategori sudah ada' });
    });

    it('mengembalikan 404 untuk kategori yang tidak ada', async () => {
        const res = await api.put('/api/categories/999999').send({ name: 'Kopi' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Kategori tidak ditemukan' });
    });

    it('mengembalikan 400 untuk id yang bukan angka', async () => {
        const res = await api.put('/api/categories/abc').send({ name: 'Kopi' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'ID tidak valid' });
    });
});

describe('DELETE /api/categories/:id', () => {
    it('menghapus kategori yang tidak punya menu', async () => {
        const snack = await prisma.category.create({ data: { name: 'Snack' } });

        const res = await api.delete(`/api/categories/${snack.id}`);

        expect(res.status).toBe(204);
        const dariDatabase = await prisma.category.findUnique({ where: { id: snack.id } });
        expect(dariDatabase).toBeNull();
    });

    it('menolak menghapus kategori yang masih punya menu, termasuk menu nonaktif', async () => {
        const kopi = await prisma.category.create({ data: { name: 'Kopi' } });
        await prisma.menu.create({
            data: { name: 'Americano', price: 18000, categoryId: kopi.id, isActive: false },
        });

        const res = await api.delete(`/api/categories/${kopi.id}`);

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Kategori masih memiliki menu' });
    });

    it('mengembalikan 404 untuk kategori yang tidak ada', async () => {
        const res = await api.delete('/api/categories/999999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Kategori tidak ditemukan' });
    });

    it('mengembalikan 400 untuk id yang bukan angka', async () => {
        const res = await api.delete('/api/categories/abc');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'ID tidak valid' });
    });
});
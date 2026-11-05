import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../src/lib/prisma.js';
import { loginAs } from './helpers/agent.js';

let kopi;
let api;

beforeEach(async () => {
    api = await loginAs('ADMIN');
    kopi = await prisma.category.create({ data: { name: 'Kopi' } });
});

function menuBaru(override = {}) {
    return { name: 'Americano', price: 18000, categoryId: kopi.id, ...override };
}

describe('POST /api/menus', () => {
    it('membuat menu baru dengan nilai bawaan', async () => {
        const res = await api.post('/api/menus').send(menuBaru());

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: 'Americano',
            price: 18000,
            imageUrl: null,
            stock: 0,
            minStock: 5,
            isActive: true,
            category: { id: kopi.id, name: 'Kopi' },
        });
    });

    it.each(['25.000', -5000, 2500.5, 0])('menolak harga %s', async (price) => {
        const res = await api.post('/api/menus').send(menuBaru({ price }));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Harga harus bilangan bulat positif' });
    });

    it('menolak stok negatif', async () => {
        const res = await api.post('/api/menus').send(menuBaru({ stock: -1 }));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Stok harus bilangan bulat, minimal 0' });
    });

    it('menolak nama kosong', async () => {
        const res = await api.post('/api/menus').send(menuBaru({ name: '   ' }));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Nama menu wajib diisi' });
    });

    it('menolak kategori yang tidak ada', async () => {
        const res = await api.post('/api/menus').send(menuBaru({ categoryId: 999999 }));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Kategori tidak ditemukan' });
    });

    it('mengabaikan isActive yang dikirim', async () => {
        const res = await api.post('/api/menus').send(menuBaru({ isActive: false }));

        expect(res.status).toBe(201);
        expect(res.body.isActive).toBe(true);
    });
});

describe('GET /api/menus', () => {
    let snack;

    beforeEach(async () => {
        snack = await prisma.category.create({ data: { name: 'Snack' } });
        await prisma.menu.createMany({
            data: [
                { name: 'Kopi Tubruk', price: 12000, categoryId: kopi.id, isActive: false },
                { name: 'Kentang Goreng', price: 18000, categoryId: snack.id },
                { name: 'Americano', price: 18000, categoryId: kopi.id },
            ],
        });
    });

    it('hanya mengembalikan menu aktif, urut nama', async () => {
        const res = await api.get('/api/menus');

        expect(res.status).toBe(200);
        expect(res.body.map((menu) => menu.name)).toEqual(['Americano', 'Kentang Goreng']);
    });

    it('menyertakan menu nonaktif bila includeInactive=true', async () => {
        const res = await api.get('/api/menus?includeInactive=true');

        expect(res.body.map((menu) => menu.name)).toEqual([
            'Americano',
            'Kentang Goreng',
            'Kopi Tubruk',
        ]);
    });

    it('memfilter berdasarkan kategori', async () => {
        const res = await api.get(`/api/menus?categoryId=${snack.id}`);

        expect(res.body.map((menu) => menu.name)).toEqual(['Kentang Goreng']);
    });

    it('menolak categoryId yang bukan angka', async () => {
        const res = await api.get('/api/menus?categoryId=abc');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Kategori tidak valid' });
    });
});

describe('GET /api/menus/:id', () => {
    it('mengembalikan detail menu', async () => {
        const menu = await prisma.menu.create({
            data: { name: 'Americano', price: 18000, categoryId: kopi.id },
        });

        const res = await api.get(`/api/menus/${menu.id}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: menu.id,
            name: 'Americano',
            category: { id: kopi.id, name: 'Kopi' },
        });
    });

    it('mengembalikan 404 untuk menu yang tidak ada', async () => {
        const res = await api.get('/api/menus/999999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
    });

    it('mengembalikan 400 untuk id yang bukan angka', async () => {
        const res = await api.get('/api/menus/abc');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'ID tidak valid' });
    });
});

describe('PUT /api/menus/:id', () => {
    let menu;

    beforeEach(async () => {
        menu = await prisma.menu.create({
            data: { name: 'Americano', price: 18000, stock: 10, categoryId: kopi.id, imageUrl: '/uploads/a.png' },
        });
    });

    it('hanya mengubah field yang dikirim', async () => {
        const res = await api.put(`/api/menus/${menu.id}`).send({ price: 20000 });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ name: 'Americano', price: 20000, stock: 10 });
    });

    it('memindahkan menu ke kategori lain', async () => {
        const snack = await prisma.category.create({ data: { name: 'Snack' } });

        const res = await api.put(`/api/menus/${menu.id}`).send({ categoryId: snack.id });

        expect(res.status).toBe(200);
        expect(res.body.category).toEqual({ id: snack.id, name: 'Snack' });
    });

    it('menghapus foto bila imageUrl dikirim null', async () => {
        const res = await api.put(`/api/menus/${menu.id}`).send({ imageUrl: null });

        expect(res.status).toBe(200);
        expect(res.body.imageUrl).toBeNull();
    });

    it('tetap memvalidasi field yang dikirim', async () => {
        const res = await api.put(`/api/menus/${menu.id}`).send({ price: -1 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Harga harus bilangan bulat positif' });
    });

    it('menolak kategori yang tidak ada', async () => {
        const res = await api.put(`/api/menus/${menu.id}`).send({ categoryId: 999999 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Kategori tidak ditemukan' });
    });

    it('mengembalikan 404 untuk menu yang tidak ada', async () => {
        const res = await api.put('/api/menus/999999').send({ price: 20000 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
    });

    it('mengaktifkan kembali menu yang nonaktif', async () => {
        await prisma.menu.update({ where: { id: menu.id }, data: { isActive: false } });

        const res = await api.put(`/api/menus/${menu.id}`).send({ isActive: true });

        expect(res.status).toBe(200);
        expect(res.body.isActive).toBe(true);
    });
});

describe('DELETE /api/menus/:id', () => {
    it('menonaktifkan menu tanpa menghapusnya dari database', async () => {
        const menu = await prisma.menu.create({
            data: { name: 'Americano', price: 18000, categoryId: kopi.id },
        });

        const res = await api.delete(`/api/menus/${menu.id}`);

        expect(res.status).toBe(204);
        const dariDatabase = await prisma.menu.findUnique({ where: { id: menu.id } });
        expect(dariDatabase).not.toBeNull();
        expect(dariDatabase.isActive).toBe(false);
    });

    it('menu yang dinonaktifkan tidak muncul di daftar', async () => {
        const menu = await prisma.menu.create({
            data: { name: 'Americano', price: 18000, categoryId: kopi.id },
        });

        await api.delete(`/api/menus/${menu.id}`);
        const res = await api.get('/api/menus');

        expect(res.body).toEqual([]);
    });

    it('mengembalikan 404 untuk menu yang tidak ada', async () => {
        const res = await api.delete('/api/menus/999999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
    });

    it('mengembalikan 400 untuk id yang bukan angka', async () => {
        const res = await api.delete('/api/menus/abc');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'ID tidak valid' });
    });
});
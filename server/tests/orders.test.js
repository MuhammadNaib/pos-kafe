import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { loginAs } from './helpers/agent.js';

let kasir;
let kopi;
let americano;
let kopiSusu;

beforeEach(async () => {
    kasir = await loginAs('CASHIER');
    kopi = await prisma.category.create({ data: { name: 'Kopi' } });
    americano = await prisma.menu.create({
        data: { name: 'Americano', price: 18000, categoryId: kopi.id },
    });
    kopiSusu = await prisma.menu.create({
        data: { name: 'Kopi Susu Aren', price: 22000, categoryId: kopi.id },
    });
});

function pesanTunai(items, cashPaid = 100000) {
    return kasir.post('/api/orders').send({ items, paymentMethod: 'CASH', cashPaid });
}

describe('POST /api/orders', () => {
    it('membuat pesanan tunai, menghitung total dan kembalian', async () => {
        const res = await pesanTunai([
            { menuId: americano.id, quantity: 2 },
            { menuId: kopiSusu.id, quantity: 1 },
        ]);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            code: expect.stringMatching(/^KS-\d{6}$/),
            status: 'PENDING',
            paymentMethod: 'CASH',
            paymentStatus: 'PAID',
            total: 58000,
            cashPaid: 100000,
            change: 42000,
            cashier: { name: 'Kasir Tes' },
        });
        expect(res.body.items).toEqual([
            { id: expect.any(Number), menuId: americano.id, menuName: 'Americano', price: 18000, quantity: 2, subtotal: 36000 },
            { id: expect.any(Number), menuId: kopiSusu.id, menuName: 'Kopi Susu Aren', price: 22000, quantity: 1, subtotal: 22000 },
        ]);
    });

    it('mengabaikan harga yang dikirim dari frontend', async () => {
        const res = await pesanTunai([{ menuId: americano.id, quantity: 1, price: 1 }]);

        expect(res.status).toBe(201);
        expect(res.body.total).toBe(18000);
    });

    it('menggabungkan menu yang sama menjadi satu baris', async () => {
        const res = await pesanTunai([
            { menuId: americano.id, quantity: 1 },
            { menuId: americano.id, quantity: 2 },
        ]);

        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0]).toMatchObject({ quantity: 3, subtotal: 54000 });
    });

    it('kembalian 0 bila uangnya pas', async () => {
        const res = await pesanTunai([{ menuId: americano.id, quantity: 1 }], 18000);

        expect(res.status).toBe(201);
        expect(res.body.change).toBe(0);
    });

    it('menolak uang yang kurang dari total', async () => {
        const res = await pesanTunai([{ menuId: americano.id, quantity: 1 }], 10000);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Uang yang diterima kurang dari total' });
    });

    it('menolak menu nonaktif dengan menyebut namanya', async () => {
        const tubruk = await prisma.menu.create({
            data: { name: 'Kopi Tubruk', price: 12000, categoryId: kopi.id, isActive: false },
        });

        const res = await pesanTunai([{ menuId: tubruk.id, quantity: 1 }]);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Menu "Kopi Tubruk" sudah tidak dijual' });
    });

    it('menolak menu yang tidak ada', async () => {
        const res = await pesanTunai([{ menuId: 999999, quantity: 1 }]);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Menu tidak ditemukan' });
    });

    it('menolak pesanan kosong', async () => {
        const res = await pesanTunai([]);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Pesanan masih kosong' });
    });

    it.each([0, 100, 1.5])('menolak jumlah %s', async (quantity) => {
        const res = await pesanTunai([{ menuId: americano.id, quantity }]);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Jumlah harus 1 sampai 99' });
    });

    it('menolak metode pembayaran selain tunai', async () => {
        const res = await kasir
            .post('/api/orders')
            .send({ items: [{ menuId: americano.id, quantity: 1 }], paymentMethod: 'QRIS' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Metode pembayaran belum didukung' });
    });

    it('pesanan lama tidak berubah saat menu diganti nama dan harga', async () => {
        const res = await pesanTunai([{ menuId: americano.id, quantity: 1 }]);
        await prisma.menu.update({
            where: { id: americano.id },
            data: { name: 'Americano Spesial', price: 25000 },
        });

        const item = await prisma.orderItem.findFirst({ where: { orderId: res.body.id } });

        expect(item).toMatchObject({ menuName: 'Americano', price: 18000 });
    });

    it('memerlukan login', async () => {
        const res = await request(app).post('/api/orders').send({});

        expect(res.status).toBe(401);
    });
});

describe('GET /api/orders', () => {
    it('kasir hanya melihat pesanannya sendiri, terbaru lebih dulu', async () => {
        const admin = await loginAs('ADMIN');
        const pertama = await pesanTunai([{ menuId: americano.id, quantity: 1 }]);
        await admin
            .post('/api/orders')
            .send({ items: [{ menuId: kopiSusu.id, quantity: 1 }], paymentMethod: 'CASH', cashPaid: 50000 });
        const kedua = await pesanTunai([{ menuId: kopiSusu.id, quantity: 2 }]);

        const res = await kasir.get('/api/orders');

        expect(res.status).toBe(200);
        expect(res.body.map((order) => order.id)).toEqual([kedua.body.id, pertama.body.id]);
    });

    it('admin melihat pesanan semua kasir', async () => {
        const admin = await loginAs('ADMIN');
        await pesanTunai([{ menuId: americano.id, quantity: 1 }]);
        await admin
            .post('/api/orders')
            .send({ items: [{ menuId: kopiSusu.id, quantity: 1 }], paymentMethod: 'CASH', cashPaid: 50000 });

        const res = await admin.get('/api/orders');

        expect(res.body.map((order) => order.cashier.name).sort()).toEqual(['Admin Tes', 'Kasir Tes']);
    });

    it('menampilkan ringkasan setiap pesanan', async () => {
        const dibuat = await pesanTunai([
            { menuId: americano.id, quantity: 2 },
            { menuId: kopiSusu.id, quantity: 1 },
        ]);

        const res = await kasir.get('/api/orders');

        expect(res.body).toEqual([
            {
                id: dibuat.body.id,
                code: dibuat.body.code,
                total: 58000,
                paymentMethod: 'CASH',
                paymentStatus: 'PAID',
                status: 'PENDING',
                createdAt: expect.any(String),
                cashier: { id: expect.any(Number), name: 'Kasir Tes' },
                itemCount: 3,
            },
        ]);
    });

    it('menyaring berdasarkan rentang waktu', async () => {
        const lama = await pesanTunai([{ menuId: americano.id, quantity: 1 }]);
        const baru = await pesanTunai([{ menuId: kopiSusu.id, quantity: 1 }]);
        await prisma.order.update({
            where: { id: lama.body.id },
            data: { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        const res = await kasir.get('/api/orders').query({
            from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            to: new Date(Date.now() + 60 * 1000).toISOString(),
        });

        expect(res.body.map((order) => order.id)).toEqual([baru.body.id]);
    });

    it('menolak rentang tanggal yang tidak valid', async () => {
        const res = await kasir.get('/api/orders').query({ from: 'abc' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Rentang tanggal tidak valid' });
    });
});

describe('GET /api/orders/:id', () => {
    it('mengembalikan detail pesanan, sama dengan saat dibuat', async () => {
        const dibuat = await pesanTunai([{ menuId: americano.id, quantity: 2 }]);

        const res = await kasir.get(`/api/orders/${dibuat.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(dibuat.body);
    });

    it('admin bisa membuka pesanan kasir mana pun', async () => {
        const admin = await loginAs('ADMIN');
        const dibuat = await pesanTunai([{ menuId: americano.id, quantity: 1 }]);

        const res = await admin.get(`/api/orders/${dibuat.body.id}`);

        expect(res.status).toBe(200);
    });

    it('kasir tidak bisa membuka pesanan kasir lain', async () => {
        const admin = await loginAs('ADMIN');
        const milikAdmin = await admin
            .post('/api/orders')
            .send({ items: [{ menuId: americano.id, quantity: 1 }], paymentMethod: 'CASH', cashPaid: 50000 });

        const res = await kasir.get(`/api/orders/${milikAdmin.body.id}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });

    it('mengembalikan 404 untuk pesanan yang tidak ada', async () => {
        const res = await kasir.get('/api/orders/999999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Pesanan tidak ditemukan' });
    });
});
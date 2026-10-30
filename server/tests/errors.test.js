import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import app from '../src/app.js';
import errorHandler from '../src/middlewares/errorHandler.js';
import HttpError from '../src/utils/HttpError.js';
import { z } from 'zod';
import validate from '../src/middlewares/validate.js';

function buatAppUji(handler) {
    const appUji = express();
    appUji.get('/uji', handler);
    appUji.use(errorHandler);
    return appUji;
}

describe('Penanganan error', () => {
    it('rute yang tidak ada mengembalikan 404', async () => {
        const res = await request(app).get('/api/tidak-ada');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Rute tidak ditemukan' });
    });

    it('HttpError dikirim dengan status dan pesannya', async () => {
        const appUji = buatAppUji(() => {
            throw new HttpError(409, 'Kategori sudah ada');
        });

        const res = await request(appUji).get('/uji');

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Kategori sudah ada' });
    });

    it('error tak terduga di fungsi async menjadi 500 tanpa membocorkan detail', async () => {
        const appUji = buatAppUji(async () => {
            throw new Error('rahasia: koneksi database gagal');
        });

        const res = await request(appUji).get('/uji');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: 'Terjadi kesalahan pada server' });
    });
});

function buatAppValidasi(schema) {
    const appUji = express();
    appUji.use(express.json());
    appUji.post('/uji', validate(schema), (req, res) => {
        res.json(req.body);
    });
    appUji.use(errorHandler);
    return appUji;
}

describe('Validasi input', () => {
    const schema = z.object({
        name: z.string().trim().min(1, 'Nama wajib diisi'),
    });

    it('data valid diteruskan dalam bentuk yang sudah dibersihkan', async () => {
        const res = await request(buatAppValidasi(schema))
            .post('/uji')
            .send({ name: '  Kopi  ', isAdmin: true });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ name: 'Kopi' });
    });

    it('data tidak valid ditolak dengan 400 dan pesan yang jelas', async () => {
        const res = await request(buatAppValidasi(schema))
            .post('/uji')
            .send({ name: '   ' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Nama wajib diisi' });
    });

    it('JSON yang rusak ditolak dengan 400, bukan 500', async () => {
        const res = await request(buatAppValidasi(schema))
            .post('/uji')
            .set('Content-Type', 'application/json')
            .send('{"name": ');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Format JSON tidak valid' });
    });
});
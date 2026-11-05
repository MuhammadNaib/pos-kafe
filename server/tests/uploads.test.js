import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { loginAs } from './helpers/agent.js';
import { UPLOAD_DIR } from '../src/modules/uploads/upload.routes.js';

let api;

beforeEach(async () => {
    api = await loginAs('ADMIN');
});

const PNG_KECIL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
);

describe('POST /api/uploads', () => {
    it('menyimpan gambar dan mengembalikan alamatnya', async () => {
        const res = await api.post('/api/uploads').attach('image', PNG_KECIL, 'kopi.png');

        expect(res.status).toBe(201);
        expect(res.body.url).toMatch(/^\/uploads\/.+\.png$/);

        const gambar = await api.get(res.body.url);
        expect(gambar.status).toBe(200);

        await fs.rm(path.join(UPLOAD_DIR, path.basename(res.body.url)));
    });

    it('menolak file yang bukan gambar', async () => {
        const res = await api
            .post('/api/uploads')
            .attach('image', Buffer.from('halo'), 'catatan.txt');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'File harus berupa gambar JPG, PNG, atau WEBP' });
    });

    it('menolak gambar lebih dari 2 MB', async () => {
        const res = await api
            .post('/api/uploads')
            .attach('image', Buffer.alloc(2 * 1024 * 1024 + 1), 'besar.png');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Ukuran gambar maksimal 2 MB' });
    });

    it('menolak request tanpa gambar', async () => {
        const res = await api.post('/api/uploads');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Gambar wajib diunggah' });
    });

    it('menolak gambar yang dikirim dengan nama field yang salah', async () => {
        const res = await api.post('/api/uploads').attach('foto', PNG_KECIL, 'kopi.png');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Upload gambar tidak valid' });
    });
});
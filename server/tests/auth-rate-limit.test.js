import { it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './helpers/users.js';

it('memblokir login setelah 10 percobaan gagal, walaupun password berikutnya benar', async () => {
    await createUser();

    for (let i = 0; i < 10; i++) {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@kafe.com', password: 'salah1234' });
        expect(res.status).toBe(401);
    }

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@kafe.com', password: 'rahasia123' });

    expect(res.status).toBe(429);
    expect(res.body).toEqual({ message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' });
});

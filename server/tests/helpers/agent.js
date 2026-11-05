import request from 'supertest';
import app from '../../src/app.js';
import { createUser } from './users.js';

export async function loginAs(role = 'ADMIN') {
    const email = `${role.toLowerCase()}.tes@kafe.com`;
    await createUser({ name: role === 'ADMIN' ? 'Admin Tes' : 'Kasir Tes', email, role });

    const agent = request.agent(app);
    const res = await agent.post('/api/auth/login').send({ email, password: 'rahasia123' });

    if (res.status !== 200) {
        throw new Error(`Login tes gagal dengan status ${res.status}`);
    }

    return agent;
}
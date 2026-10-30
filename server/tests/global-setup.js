import { execSync } from 'node:child_process';

export default function setup() {
    if (!process.env.DATABASE_URL?.includes('pos_kafe_test')) {
        throw new Error('Tes harus memakai database pos_kafe_test. Cek file .env.test');
    }

    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
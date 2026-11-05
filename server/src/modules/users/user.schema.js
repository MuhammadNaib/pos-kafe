import { z } from 'zod';

const nama = z
    .string({ error: 'Nama wajib diisi' })
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter');

const password = z
    .string({ error: 'Password minimal 8 karakter' })
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter');

const peran = z.enum(['ADMIN', 'CASHIER'], { error: 'Peran harus ADMIN atau CASHIER' });

export const createUserSchema = z.object({
    name: nama,
    email: z
        .string({ error: 'Email wajib diisi' })
        .trim()
        .toLowerCase()
        .pipe(z.email('Format email tidak valid')),
    password,
    role: peran,
});

export const updateUserSchema = z.object({
    name: nama.optional(),
    role: peran.optional(),
    isActive: z.boolean({ error: 'Status aktif harus true atau false' }).optional(),
    password: password.optional(),
});
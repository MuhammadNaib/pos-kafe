import { z } from 'zod';

export const categorySchema = z.object({
    name: z
        .string({ error: 'Nama kategori wajib diisi' })
        .trim()
        .min(1, 'Nama kategori wajib diisi')
        .max(50, 'Nama kategori maksimal 50 karakter'),
});

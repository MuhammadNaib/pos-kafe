import { z } from 'zod';

const PESAN_HARGA = 'Harga harus bilangan bulat positif';
const PESAN_STOK = 'Stok harus bilangan bulat, minimal 0';
const PESAN_STOK_MIN = 'Stok minimum harus bilangan bulat, minimal 0';
const PESAN_KATEGORI = 'Kategori wajib dipilih';

export const menuSchema = z.object({
    name: z
        .string({ error: 'Nama menu wajib diisi' })
        .trim()
        .min(1, 'Nama menu wajib diisi')
        .max(100, 'Nama menu maksimal 100 karakter'),
    price: z.number({ error: PESAN_HARGA }).int(PESAN_HARGA).positive(PESAN_HARGA),
    stock: z.number({ error: PESAN_STOK }).int(PESAN_STOK).min(0, PESAN_STOK).optional(),
    minStock: z
        .number({ error: PESAN_STOK_MIN })
        .int(PESAN_STOK_MIN)
        .min(0, PESAN_STOK_MIN)
        .optional(),
    categoryId: z
        .number({ error: PESAN_KATEGORI })
        .int(PESAN_KATEGORI)
        .positive(PESAN_KATEGORI),
    imageUrl: z.string().nullable().optional(),
});

export const menuUpdateSchema = menuSchema.partial().extend({
    isActive: z.boolean({ error: 'Status aktif harus true atau false' }).optional(),
});
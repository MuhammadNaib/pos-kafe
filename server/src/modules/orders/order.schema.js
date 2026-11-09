import { z } from 'zod';

const PESAN_JUMLAH = 'Jumlah harus 1 sampai 99';

const itemSchema = z.object({
  menuId: z.number({ error: 'Menu tidak valid' }).int('Menu tidak valid').positive('Menu tidak valid'),
  quantity: z
    .number({ error: PESAN_JUMLAH })
    .int(PESAN_JUMLAH)
    .min(1, PESAN_JUMLAH)
    .max(99, PESAN_JUMLAH),
});

export const createOrderSchema = z.object({
  items: z
    .array(itemSchema, { error: 'Pesanan masih kosong' })
    .min(1, 'Pesanan masih kosong')
    .max(50, 'Maksimal 50 jenis menu dalam satu pesanan'),
  paymentMethod: z.literal('CASH', { error: 'Metode pembayaran belum didukung' }),
  cashPaid: z
    .number({ error: 'Uang yang diterima wajib diisi' })
    .int('Uang yang diterima harus bilangan bulat')
    .min(0, 'Uang yang diterima tidak boleh negatif'),
});
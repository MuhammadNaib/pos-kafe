import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { isValidSignature } from '../src/lib/midtrans-signature.js';
import { toPaymentStatus } from '../src/lib/midtrans.js';

const SERVER_KEY = 'SB-Mid-server-TES';

function tandaTangani(body) {
    const signature_key = createHash('sha512')
        .update(body.order_id + body.status_code + body.gross_amount + SERVER_KEY)
        .digest('hex');
    return { ...body, signature_key };
}

const notifikasi = tandaTangani({ order_id: 'KS-000001-abc', status_code: '200', gross_amount: '40000.00' });

describe('isValidSignature', () => {
    it('menerima signature yang benar', () => {
        expect(isValidSignature(notifikasi, SERVER_KEY)).toBe(true);
    });

    it('menolak bila isi notifikasi diubah', () => {
        expect(isValidSignature({ ...notifikasi, gross_amount: '1.00' }, SERVER_KEY)).toBe(false);
    });

    it('menolak signature dengan panjang berbeda tanpa melempar error', () => {
        expect(isValidSignature({ ...notifikasi, signature_key: 'abc' }, SERVER_KEY)).toBe(false);
    });

    it('menolak notifikasi tanpa signature', () => {
        expect(isValidSignature({ ...notifikasi, signature_key: undefined }, SERVER_KEY)).toBe(false);
    });
});

describe('toPaymentStatus', () => {
    it.each([
        ['settlement', 'PAID'],
        ['capture', 'PAID'],
        ['pending', 'UNPAID'],
        ['expire', 'EXPIRED'],
        ['cancel', 'EXPIRED'],
        ['deny', 'EXPIRED'],
        ['failure', 'EXPIRED'],
    ])('%s → %s', (transactionStatus, harapan) => {
        expect(toPaymentStatus(transactionStatus)).toBe(harapan);
    });
});
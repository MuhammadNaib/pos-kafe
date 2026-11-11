import { createHash, timingSafeEqual } from 'node:crypto';

export function isValidSignature({ order_id, status_code, gross_amount, signature_key }, serverKey) {
    if (typeof signature_key !== 'string') return false;

    const harapan = createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');

    const a = Buffer.from(harapan);
    const b = Buffer.from(signature_key);

    return a.length === b.length && timingSafeEqual(a, b);
}
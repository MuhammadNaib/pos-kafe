import HttpError from '../utils/HttpError.js';

const PESAN_GAGAL = 'Gagal menghubungi Midtrans, coba lagi';

const STATUS_PEMBAYARAN = {
    settlement: 'PAID',
    capture: 'PAID',
    pending: 'UNPAID',
};

export function toPaymentStatus(transactionStatus) {
    return STATUS_PEMBAYARAN[transactionStatus] ?? 'EXPIRED';
}

function gagal(alasan) {
    console.warn('Midtrans:', alasan);
    return new HttpError(502, PESAN_GAGAL);
}

async function panggilMidtrans(path, { method = 'GET', body } = {}) {
    const kunci = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');
    let response;

    try {
        response = await fetch(`${process.env.MIDTRANS_API_URL}${path}`, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Basic ${kunci}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (error) {
        throw gagal(`tidak bisa dihubungi (${error.message})`);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
        throw gagal(`HTTP ${response.status}`);
    }

    return data;
}

export async function createQrisCharge({ orderId, grossAmount, expiryMinutes }) {
    const data = await panggilMidtrans('/v2/charge', {
        method: 'POST',
        body: {
            payment_type: 'qris',
            transaction_details: { order_id: orderId, gross_amount: grossAmount },
            custom_expiry: { expiry_duration: expiryMinutes, unit: 'minute' },
        },
    });

    const aksiQr = data.actions?.find((aksi) => aksi.name === 'generate-qr-code');

    if (data.status_code !== '201' || !aksiQr) {
        throw gagal(`charge ditolak (${data.status_code} ${data.status_message})`);
    }

    return {
        qrUrl: aksiQr.url,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    };
}

export async function getTransactionStatus(orderId) {
    const data = await panggilMidtrans(`/v2/${encodeURIComponent(orderId)}/status`);

    if (typeof data.transaction_status !== 'string') {
        throw gagal(`status tidak dikenal (${data.status_code} ${data.status_message})`);
    }

    return data.transaction_status;
}

export async function cancelTransaction(orderId) {
    const data = await panggilMidtrans(`/v2/${encodeURIComponent(orderId)}/cancel`, { method: 'POST' });

    if (data.status_code !== '200') {
        throw gagal(`batal ditolak (${data.status_code} ${data.status_message})`);
    }
}
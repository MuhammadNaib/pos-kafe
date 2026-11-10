export function formatRupiah(value) {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

const FORMAT_WAKTU = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export function formatWaktu(iso) {
    return FORMAT_WAKTU.format(new Date(iso));
}
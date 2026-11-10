import { useState } from 'react';
import { formatRupiah } from '../../lib/format.js';

const UANG_CEPAT = [50000, 100000];

export default function CashPaymentModal({ total, onSubmit, onCancel }) {
  const [angka, setAngka] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uangDiterima = Number(angka);
  const kembalian = uangDiterima - total;
  const cukup = angka !== '' && kembalian >= 0;

  function ketik(event) {
    setAngka(event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!cukup || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(uangDiterima);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-pastel-persik px-5 py-4">
        <p className="text-sm text-kopi-600">Total tagihan</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatRupiah(total)}</p>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold">Uang diterima</span>
        <div className="mt-2 flex items-center rounded-xl bg-latar px-4 ring-1 ring-garis focus-within:ring-2 focus-within:ring-jeruk-500">
          <span className="font-semibold text-kopi-400">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            data-autofocus
            value={angka === '' ? '' : uangDiterima.toLocaleString('id-ID')}
            onChange={ketik}
            placeholder="0"
            className="w-full bg-transparent px-2 py-3 text-lg font-bold tabular-nums outline-none placeholder:text-kopi-400"
          />
        </div>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAngka(String(total))}
          className="rounded-full bg-jeruk-50 px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-100"
        >
          Uang pas
        </button>
        {UANG_CEPAT.map((nominal) => (
          <button
            key={nominal}
            type="button"
            onClick={() => setAngka(String(nominal))}
            disabled={nominal < total}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold tabular-nums ring-1 ring-garis hover:bg-latar disabled:opacity-40"
          >
            {formatRupiah(nominal)}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-garis pt-4">
        <span className="text-sm text-kopi-600">{angka !== '' && !cukup ? 'Uang kurang' : 'Kembalian'}</span>
        <span
          className={`text-2xl font-extrabold tabular-nums ${angka !== '' && !cukup ? 'text-red-600' : 'text-green-700'}`}
          aria-live="polite"
        >
          {angka === '' ? '–' : formatRupiah(Math.abs(kembalian))}
        </span>
      </div>

      {error && <p className="mt-4 rounded-xl bg-pastel-merah px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-kopi-600 hover:bg-latar"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!cukup || isSubmitting}
          className="rounded-xl bg-jeruk-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-jeruk-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Selesaikan pembayaran'}
        </button>
      </div>
    </form>
  );
}
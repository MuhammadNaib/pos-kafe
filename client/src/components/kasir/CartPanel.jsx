import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatRupiah } from '../../lib/format.js';
import { MAKS_JUMLAH, hitungJumlahItem, hitungTotal } from '../../lib/cart.js';

export default function CartPanel({ items, dispatch, onBayar }) {
  const total = hitungTotal(items);
  const jumlahItem = hitungJumlahItem(items);
  const kosong = items.length === 0;

  return (
    <aside className="flex max-h-[calc(100vh-7rem)] flex-col rounded-3xl border border-garis bg-white md:sticky md:top-4">
      <div className="flex items-center justify-between gap-2 border-b border-garis px-5 py-4">
        <h2 className="font-bold">
          Pesanan
          {!kosong && <span className="ml-2 text-sm font-medium text-kopi-400 tabular-nums">{jumlahItem} item</span>}
        </h2>
        {!kosong && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'kosongkan' })}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-kopi-600 hover:bg-latar hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
            Kosongkan
          </button>
        )}
      </div>

      {kosong ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-pastel-persik text-jeruk-500">
            <ShoppingBag className="size-6" strokeWidth={1.75} />
          </span>
          <p className="mt-4 font-semibold">Keranjang masih kosong</p>
          <p className="mt-1 text-sm text-kopi-600">Ketuk menu untuk mulai menyusun pesanan.</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-garis overflow-y-auto px-5">
          {items.map((item) => (
            <li key={item.menuId} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-snug">{item.name}</p>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{formatRupiah(item.price * item.quantity)}</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-kopi-400 tabular-nums">{formatRupiah(item.price)}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'kurangi', menuId: item.menuId })}
                    aria-label={`Kurangi ${item.name}`}
                    className="grid size-8 place-items-center rounded-full bg-latar text-kopi-900 ring-1 ring-garis hover:bg-garis"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'tambah', menu: { id: item.menuId, name: item.name, price: item.price } })}
                    disabled={item.quantity >= MAKS_JUMLAH}
                    aria-label={`Tambah satu ${item.name}`}
                    className="grid size-8 place-items-center rounded-full bg-jeruk-500 text-white hover:bg-jeruk-600 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-garis px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-kopi-600">Total</span>
          <span className="text-xl font-extrabold tabular-nums">{formatRupiah(total)}</span>
        </div>
        <button
          type="button"
          onClick={onBayar}
          disabled={kosong}
          className="mt-4 w-full rounded-xl bg-jeruk-500 py-3 text-sm font-bold text-white shadow-sm shadow-jeruk-500/30 hover:bg-jeruk-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Bayar tunai
        </button>
      </div>
    </aside>
  );
}
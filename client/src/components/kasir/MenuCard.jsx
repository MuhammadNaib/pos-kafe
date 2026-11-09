import { Coffee, Plus } from 'lucide-react';
import { formatRupiah } from '../../lib/format.js';

export default function MenuCard({ menu, jumlahDiKeranjang, onTambah }) {
  const stokMenipis = menu.stock <= menu.minStock;

  return (
    <button
      type="button"
      onClick={() => onTambah(menu)}
      aria-label={`Tambah ${menu.name}`}
      className="group flex flex-col rounded-3xl border border-garis bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-kopi-900/5"
    >
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-pastel-persik text-jeruk-500">
        {menu.imageUrl ? (
          <img src={menu.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <Coffee className="size-10" strokeWidth={1.5} />
        )}

        {stokMenipis && (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-red-700">
            Stok menipis
          </span>
        )}

        {jumlahDiKeranjang > 0 && (
          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-kopi-900 text-xs font-bold text-white tabular-nums">
            {jumlahDiKeranjang}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-end justify-between gap-2 px-1 pt-3 pb-1">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{menu.name}</p>
          <p className="mt-1 font-bold text-jeruk-600 tabular-nums">{formatRupiah(menu.price)}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-jeruk-500 text-white transition group-hover:bg-jeruk-600">
          <Plus className="size-5" strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}
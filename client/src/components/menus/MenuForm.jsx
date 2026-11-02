import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { uploadImage } from '../../lib/api.js';
import { formatRupiah } from '../../lib/format.js';

const KELAS_INPUT =
  'w-full rounded-xl bg-latar px-4 py-3 ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500';

export default function MenuForm({ menu, categories, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: menu?.name ?? '',
    categoryId: menu?.category.id ?? categories[0]?.id ?? '',
    price: menu?.price ?? '',
    stock: menu?.stock ?? 0,
    minStock: menu?.minStock ?? 5,
    imageUrl: menu?.imageUrl ?? null,
  });
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function ubah(field, value) {
    setValues((sebelumnya) => ({ ...sebelumnya, [field]: value }));
  }

  async function pilihFoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      ubah('imageUrl', await uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: values.name,
        categoryId: Number(values.categoryId),
        price: Number(values.price),
        stock: Number(values.stock),
        minStock: Number(values.minStock),
        imageUrl: values.imageUrl,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-latar ring-1 ring-garis">
          {values.imageUrl ? (
            <>
              <img src={values.imageUrl} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => ubah('imageUrl', null)}
                aria-label="Hapus foto"
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-white/90 text-kopi-600 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="grid size-full place-items-center text-kopi-400">
              <ImagePlus className="size-7" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div>
          <label className="inline-block cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50 has-focus-visible:outline-2 has-focus-visible:outline-jeruk-500">
            {isUploading ? 'Mengunggah…' : values.imageUrl ? 'Ganti foto' : 'Pilih foto'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={pilihFoto}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-kopi-400">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Nama menu</span>
        <input
          autoFocus
          value={values.name}
          onChange={(event) => ubah('name', event.target.value)}
          placeholder="Contoh: Kopi Susu Gula Aren"
          maxLength={100}
          className={KELAS_INPUT}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Kategori</span>
          <select
            value={values.categoryId}
            onChange={(event) => ubah('categoryId', event.target.value)}
            className={KELAS_INPUT}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Harga (Rp)</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.price}
            onChange={(event) => ubah('price', event.target.value)}
            placeholder="22000"
            className={`${KELAS_INPUT} tabular-nums`}
          />
          {values.price > 0 && (
            <span className="text-xs text-kopi-400">{formatRupiah(Number(values.price))}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Stok</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.stock}
            onChange={(event) => ubah('stock', event.target.value)}
            className={`${KELAS_INPUT} tabular-nums`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Batas stok menipis</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.minStock}
            onChange={(event) => ubah('minStock', event.target.value)}
            className={`${KELAS_INPUT} tabular-nums`}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-kopi-600 hover:bg-latar"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-xl bg-jeruk-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Menyimpan…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
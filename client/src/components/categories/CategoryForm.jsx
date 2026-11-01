import { useState } from 'react';

export default function CategoryForm({ initialName = '', submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Nama kategori</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Kopi"
          maxLength={50}
          aria-invalid={error !== ''}
          className="rounded-xl bg-latar px-4 py-3 ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500 aria-invalid:ring-red-500"
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </label>

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
          disabled={isSubmitting}
          className="rounded-xl bg-jeruk-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Menyimpan…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
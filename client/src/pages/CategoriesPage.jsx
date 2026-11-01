import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import Modal from '../components/ui/Modal.jsx';
import CategoryForm from '../components/categories/CategoryForm.jsx';

const WARNA_KARTU = [
  'bg-pastel-hijau',
  'bg-pastel-persik',
  'bg-pastel-merah',
  'bg-pastel-ungu',
  'bg-pastel-kuning',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function muatKategori() {
    try {
      setCategories(await api('/categories'));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
    }
  }

  useEffect(() => {
    muatKategori();
  }, []);

  async function simpanKategori(name) {
    const isEdit = formTarget.id !== undefined;

    if (isEdit) {
      await api(`/categories/${formTarget.id}`, { method: 'PUT', body: { name } });
    } else {
      await api('/categories', { method: 'POST', body: { name } });
    }

    toast.success(isEdit ? 'Kategori diperbarui' : 'Kategori ditambahkan');
    setFormTarget(null);
    await muatKategori();
  }

  async function hapusKategori() {
    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      await api(`/categories/${target.id}`, { method: 'DELETE' });
      toast.success('Kategori dihapus');
      await muatKategori();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="mt-1 text-kopi-600">Kelompokkan menu supaya kasir cepat menemukannya.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget({})}
          className="flex items-center gap-2 rounded-xl bg-jeruk-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Tambah kategori
        </button>
      </div>

      {status === 'loading' && <p className="text-kopi-600">Memuat kategori…</p>}

      {status === 'error' && (
        <div className="rounded-2xl border border-garis bg-white p-6">
          <p className="font-semibold">Kategori gagal dimuat.</p>
          <p className="mt-1 text-sm text-kopi-600">Pastikan server backend menyala, lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => {
              setStatus('loading');
              muatKategori();
            }}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50"
          >
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-garis bg-white p-10 text-center">
          <p className="font-semibold">Belum ada kategori.</p>
          <p className="mt-1 text-sm text-kopi-600">Tambahkan kategori pertama, misalnya Kopi atau Makanan.</p>
        </div>
      )}

      {status === 'ready' && categories.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
          {categories.map((category) => (
            <li
              key={category.id}
              className={`flex min-h-40 flex-col justify-between rounded-3xl p-5 ${WARNA_KARTU[category.id % WARNA_KARTU.length]}`}
            >
              <div>
                <h2 className="text-xl font-bold tracking-tight">{category.name}</h2>
                <p className="mt-1 text-sm text-kopi-600">{category.menuCount} menu</p>
              </div>

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setFormTarget(category)}
                  aria-label={`Ubah ${category.name}`}
                  className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-white/70 hover:text-kopi-900"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(category)}
                  aria-label={`Hapus ${category.name}`}
                  className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-white/70 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formTarget !== null}
        title={formTarget?.id ? 'Ubah kategori' : 'Tambah kategori'}
        onClose={() => setFormTarget(null)}
      >
        <CategoryForm
          initialName={formTarget?.name}
          submitLabel={formTarget?.id ? 'Simpan perubahan' : 'Tambah kategori'}
          onSubmit={simpanKategori}
          onCancel={() => setFormTarget(null)}
        />
      </Modal>

      <Modal open={deleteTarget !== null} title="Hapus kategori" onClose={() => setDeleteTarget(null)}>
        {deleteTarget?.menuCount > 0 ? (
          <p className="text-kopi-600">
            <strong className="text-kopi-900">{deleteTarget.name}</strong> masih memiliki{' '}
            {deleteTarget.menuCount} menu, termasuk menu yang dinonaktifkan. Pindahkan menunya ke kategori
            lain dulu, lalu hapus kategori ini.
          </p>
        ) : (
          <p className="text-kopi-600">
            Kategori <strong className="text-kopi-900">{deleteTarget?.name}</strong> akan dihapus permanen.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-kopi-600 hover:bg-latar"
          >
            {deleteTarget?.menuCount > 0 ? 'Mengerti' : 'Batal'}
          </button>
          {deleteTarget?.menuCount === 0 && (
            <button
              type="button"
              onClick={hapusKategori}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Hapus kategori
            </button>
          )}
        </div>
      </Modal>
    </section>
  );
}
import { useEffect, useState } from 'react';
import { Coffee, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { formatRupiah } from '../lib/format.js';
import Modal from '../components/ui/Modal.jsx';
import MenuForm from '../components/menus/MenuForm.jsx';

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filterKategori, setFilterKategori] = useState('');
  const [tampilkanNonaktif, setTampilkanNonaktif] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [nonaktifTarget, setNonaktifTarget] = useState(null);

  async function muatMenu() {
    const params = new URLSearchParams();
    if (filterKategori) params.set('categoryId', filterKategori);
    if (tampilkanNonaktif) params.set('includeInactive', 'true');

    try {
      setMenus(await api(`/menus?${params}`));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
    }
  }

  useEffect(() => {
    api('/categories')
      .then(setCategories)
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    muatMenu();
  }, [filterKategori, tampilkanNonaktif]);

  async function simpanMenu(data) {
    const isEdit = formTarget.id !== undefined;

    if (isEdit) {
      await api(`/menus/${formTarget.id}`, { method: 'PUT', body: data });
    } else {
      await api('/menus', { method: 'POST', body: data });
    }

    toast.success(isEdit ? 'Menu diperbarui' : 'Menu ditambahkan');
    setFormTarget(null);
    await muatMenu();
  }

  async function nonaktifkanMenu() {
    const target = nonaktifTarget;
    setNonaktifTarget(null);

    try {
      await api(`/menus/${target.id}`, { method: 'DELETE' });
      toast.success(`${target.name} dinonaktifkan`);
      await muatMenu();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function aktifkanMenu(menu) {
    try {
      await api(`/menus/${menu.id}`, { method: 'PUT', body: { isActive: true } });
      toast.success(`${menu.name} diaktifkan kembali`);
      await muatMenu();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
          <p className="mt-1 text-kopi-600">Atur harga, stok, dan foto yang tampil di layar kasir.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget({})}
          disabled={categories.length === 0}
          className="flex items-center gap-2 rounded-xl bg-jeruk-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600 disabled:opacity-60"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Tambah menu
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <select
          value={filterKategori}
          onChange={(event) => setFilterKategori(event.target.value)}
          aria-label="Filter kategori"
          className="rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500"
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-kopi-600">
          <input
            type="checkbox"
            checked={tampilkanNonaktif}
            onChange={(event) => setTampilkanNonaktif(event.target.checked)}
            className="size-4 accent-jeruk-500"
          />
          Tampilkan menu nonaktif
        </label>
      </div>

      {status === 'loading' && <p className="text-kopi-600">Memuat menu…</p>}

      {status === 'error' && (
        <div className="rounded-2xl border border-garis bg-white p-6">
          <p className="font-semibold">Menu gagal dimuat.</p>
          <p className="mt-1 text-sm text-kopi-600">Pastikan server backend menyala, lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => {
              setStatus('loading');
              muatMenu();
            }}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50"
          >
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && menus.length === 0 && (
        <div className="rounded-2xl border border-dashed border-garis bg-white p-10 text-center">
          <p className="font-semibold">Belum ada menu di sini.</p>
          <p className="mt-1 text-sm text-kopi-600">
            {categories.length === 0
              ? 'Buat kategori dulu di halaman Kategori, lalu tambahkan menu.'
              : 'Tambahkan menu, atau ubah filter di atas.'}
          </p>
        </div>
      )}

      {status === 'ready' && menus.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-garis bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-garis text-kopi-400">
              <tr>
                <th className="px-5 py-3 font-medium">Menu</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 text-right font-medium">Harga</th>
                <th className="px-5 py-3 text-right font-medium">Stok</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {menus.map((menu) => {
                const stokMenipis = menu.stock <= menu.minStock;

                return (
                  <tr key={menu.id} className={menu.isActive ? '' : 'bg-latar/60 text-kopi-400'}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-pastel-persik text-jeruk-500">
                          {menu.imageUrl ? (
                            <img src={menu.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <Coffee className="size-5" strokeWidth={1.75} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-kopi-900">{menu.name}</p>
                          {!menu.isActive && <p className="text-xs">Nonaktif</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{menu.category.name}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatRupiah(menu.price)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-2">
                        {stokMenipis && menu.isActive && (
                          <span className="rounded-full bg-pastel-merah px-2 py-0.5 text-xs font-semibold text-red-700">
                            Stok menipis
                          </span>
                        )}
                        {menu.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setFormTarget(menu)}
                          aria-label={`Ubah ${menu.name}`}
                          className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-kopi-900"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {menu.isActive ? (
                          <button
                            type="button"
                            onClick={() => setNonaktifTarget(menu)}
                            aria-label={`Nonaktifkan ${menu.name}`}
                            className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-red-600"
                          >
                            <EyeOff className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => aktifkanMenu(menu)}
                            aria-label={`Aktifkan ${menu.name}`}
                            className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-jeruk-600"
                          >
                            <Eye className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formTarget !== null}
        title={formTarget?.id ? 'Ubah menu' : 'Tambah menu'}
        onClose={() => setFormTarget(null)}
        size="max-w-lg"
      >
        <MenuForm
          menu={formTarget?.id ? formTarget : null}
          categories={categories}
          submitLabel={formTarget?.id ? 'Simpan perubahan' : 'Tambah menu'}
          onSubmit={simpanMenu}
          onCancel={() => setFormTarget(null)}
        />
      </Modal>

      <Modal open={nonaktifTarget !== null} title="Nonaktifkan menu" onClose={() => setNonaktifTarget(null)}>
        <p className="text-kopi-600">
          <strong className="text-kopi-900">{nonaktifTarget?.name}</strong> tidak akan tampil di layar kasir.
          Riwayat transaksinya tetap tersimpan, dan menu ini bisa diaktifkan kembali kapan saja.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setNonaktifTarget(null)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-kopi-600 hover:bg-latar"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={nonaktifkanMenu}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Nonaktifkan menu
          </button>
        </div>
      </Modal>
    </section>
  );
}
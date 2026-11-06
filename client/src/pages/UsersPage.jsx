import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Modal from '../components/ui/Modal.jsx';
import UserForm from '../components/users/UserForm.jsx';

const LABEL_PERAN = { ADMIN: 'Pemilik', CASHIER: 'Kasir' };
const WARNA_PERAN = {
  ADMIN: 'bg-pastel-persik text-jeruk-600',
  CASHIER: 'bg-pastel-ungu text-violet-700',
};

export default function UsersPage() {
  const { user: saya, muatUlangSaya } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formTarget, setFormTarget] = useState(null);
  const [nonaktifTarget, setNonaktifTarget] = useState(null);

  async function muatUser() {
    try {
      setUsers(await api('/users'));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
    }
  }

  useEffect(() => {
    muatUser();
  }, []);

  async function simpanUser(data) {
    const isEdit = formTarget.id !== undefined;

    if (isEdit) {
      await api(`/users/${formTarget.id}`, { method: 'PUT', body: data });
    } else {
      await api('/users', { method: 'POST', body: data });
    }

    if (isEdit && formTarget.id === saya.id) {
      await muatUlangSaya();
    }

    toast.success(isEdit ? 'Akun diperbarui' : 'Akun dibuat');
    setFormTarget(null);
    await muatUser();
  }

  async function ubahStatus(target, isActive) {
    try {
      await api(`/users/${target.id}`, { method: 'PUT', body: { isActive } });
      toast.success(isActive ? `${target.name} diaktifkan kembali` : `${target.name} dinonaktifkan`);
      await muatUser();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function konfirmasiNonaktif() {
    const target = nonaktifTarget;
    setNonaktifTarget(null);
    ubahStatus(target, false);
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User</h1>
          <p className="mt-1 text-kopi-600">Buat akun untuk kasir dan atur siapa yang boleh masuk.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget({})}
          className="flex items-center gap-2 rounded-xl bg-jeruk-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Tambah akun
        </button>
      </div>

      {status === 'loading' && <p className="text-kopi-600">Memuat akun…</p>}

      {status === 'error' && (
        <div className="rounded-2xl border border-garis bg-white p-6">
          <p className="font-semibold">Daftar akun gagal dimuat.</p>
          <p className="mt-1 text-sm text-kopi-600">Pastikan server backend menyala, lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => {
              setStatus('loading');
              muatUser();
            }}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50"
          >
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div className="overflow-x-auto rounded-3xl border border-garis bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-garis text-kopi-400">
              <tr>
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Peran</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {users.map((user) => {
                const isSelf = user.id === saya.id;

                return (
                  <tr key={user.id} className={user.isActive ? '' : 'bg-latar/60 text-kopi-400'}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pastel-persik font-bold text-jeruk-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-kopi-900">
                            {user.name}
                            {isSelf && <span className="ml-2 text-xs font-medium text-kopi-400">(Anda)</span>}
                          </p>
                          {!user.isActive && <p className="text-xs">Nonaktif</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${WARNA_PERAN[user.role]}`}>
                        {LABEL_PERAN[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setFormTarget(user)}
                          aria-label={`Ubah ${user.name}`}
                          className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-kopi-900"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {!isSelf &&
                          (user.isActive ? (
                            <button
                              type="button"
                              onClick={() => setNonaktifTarget(user)}
                              aria-label={`Nonaktifkan ${user.name}`}
                              className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-red-600"
                            >
                              <EyeOff className="size-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => ubahStatus(user, true)}
                              aria-label={`Aktifkan ${user.name}`}
                              className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-jeruk-600"
                            >
                              <Eye className="size-4" />
                            </button>
                          ))}
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
        title={formTarget?.id ? 'Ubah akun' : 'Tambah akun'}
        onClose={() => setFormTarget(null)}
      >
        <UserForm
          user={formTarget?.id ? formTarget : null}
          isSelf={formTarget?.id === saya.id}
          submitLabel={formTarget?.id ? 'Simpan perubahan' : 'Buat akun'}
          onSubmit={simpanUser}
          onCancel={() => setFormTarget(null)}
        />
      </Modal>

      <Modal open={nonaktifTarget !== null} title="Nonaktifkan akun" onClose={() => setNonaktifTarget(null)}>
        <p className="text-kopi-600">
          <strong className="text-kopi-900">{nonaktifTarget?.name}</strong> tidak bisa masuk lagi, dan langsung
          dikeluarkan pada aksi berikutnya. Riwayat transaksinya tetap tersimpan, dan akun ini bisa diaktifkan
          kembali kapan saja.
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
            onClick={konfirmasiNonaktif}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Nonaktifkan akun
          </button>
        </div>
      </Modal>
    </section>
  );
}
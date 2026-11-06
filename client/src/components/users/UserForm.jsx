import { useState } from 'react';

const KELAS_INPUT =
  'w-full rounded-xl bg-latar px-4 py-3 ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500 disabled:opacity-60';

export default function UserForm({ user, isSelf, submitLabel, onSubmit, onCancel }) {
  const isEdit = user !== null;
  const [values, setValues] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'CASHIER',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function ubah(field, value) {
    setValues((sebelumnya) => ({ ...sebelumnya, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const data = isEdit
      ? { name: values.name, ...(isSelf ? {} : { role: values.role }) }
      : { name: values.name, email: values.email, password: values.password, role: values.role };

    if (isEdit && values.password !== '') {
      data.password = values.password;
    }

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Nama</span>
        <input
          autoFocus
          value={values.name}
          onChange={(event) => ubah('name', event.target.value)}
          placeholder="Contoh: Budi"
          maxLength={100}
          className={KELAS_INPUT}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Email</span>
        <input
          type="email"
          value={values.email}
          onChange={(event) => ubah('email', event.target.value)}
          disabled={isEdit}
          placeholder="budi@kafesenja.com"
          className={KELAS_INPUT}
        />
        {isEdit && <span className="text-xs text-kopi-400">Email tidak bisa diubah.</span>}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">{isEdit ? 'Password baru' : 'Password'}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => ubah('password', event.target.value)}
          className={KELAS_INPUT}
        />
        <span className="text-xs text-kopi-400">
          {isEdit ? 'Kosongkan bila tidak ingin mengganti. ' : ''}Minimal 8 karakter.
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Peran</span>
        <select
          value={values.role}
          onChange={(event) => ubah('role', event.target.value)}
          disabled={isSelf}
          className={KELAS_INPUT}
        >
          <option value="CASHIER">Kasir</option>
          <option value="ADMIN">Pemilik</option>
        </select>
        {isSelf && <span className="text-xs text-kopi-400">Peran akun Anda sendiri tidak bisa diubah.</span>}
      </label>

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
          disabled={isSubmitting}
          className="rounded-xl bg-jeruk-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-jeruk-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Menyimpan…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
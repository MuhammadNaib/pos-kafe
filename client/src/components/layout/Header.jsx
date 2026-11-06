import { LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext.jsx';

const LABEL_PERAN = { ADMIN: 'Pemilik', CASHIER: 'Kasir' };

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function keluar() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-garis bg-white/70 px-8 py-4 backdrop-blur">
      <label className="flex w-full max-w-md items-center gap-2 rounded-full bg-latar px-4 py-2.5 ring-1 ring-garis focus-within:ring-2 focus-within:ring-jeruk-500">
        <Search className="size-4 text-kopi-400" />
        <input
          type="search"
          placeholder="Cari menu"
          className="w-full bg-transparent text-sm outline-none placeholder:text-kopi-400"
        />
      </label>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-kopi-400">{LABEL_PERAN[user.role]}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-pastel-persik font-bold text-jeruk-600">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={keluar}
          aria-label="Keluar"
          title="Keluar"
          className="grid size-10 place-items-center rounded-full text-kopi-600 hover:bg-latar hover:text-red-600"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
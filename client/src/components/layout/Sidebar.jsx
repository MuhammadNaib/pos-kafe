import { NavLink } from 'react-router';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  Coffee,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  History,
  UtensilsCrossed,
  Tags,
  Armchair,
  Users,
} from 'lucide-react';

const MENU_UTAMA = [
  { to: '/kasir', label: 'Kasir', icon: ShoppingBag },
  { to: '/pesanan', label: 'Pesanan', icon: ClipboardList },
  { to: '/riwayat', label: 'Riwayat', icon: History },
];

const MENU_ADMIN = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/kategori', label: 'Kategori', icon: Tags },
  { to: '/meja', label: 'Meja', icon: Armchair },
  { to: '/user', label: 'User', icon: Users },
];

function ItemNavigasi({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
          isActive ? 'bg-jeruk-50 text-jeruk-600' : 'text-kopi-600 hover:bg-garis/50 hover:text-kopi-900'
        }`
      }
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.75} />
      <span className="sr-only lg:not-sr-only">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  return (
    <aside className="flex w-20 shrink-0 flex-col border-r border-garis bg-white px-3 py-6 lg:w-60 lg:px-4">
      <div className="mb-8 flex items-center justify-center gap-2.5 lg:justify-start lg:px-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-jeruk-500 text-white">
          <Coffee className="size-5" strokeWidth={2} />
        </span>
        <span className="sr-only text-lg font-extrabold tracking-tight lg:not-sr-only">Kafe Senja</span>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU_UTAMA.map((item) => (
          <ItemNavigasi key={item.to} {...item} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <p className="mt-6 mb-2 border-t border-garis pt-6 text-center text-xs font-semibold text-kopi-400 lg:mt-8 lg:border-0 lg:px-3 lg:pt-0 lg:text-left">
            <span className="sr-only lg:not-sr-only">Kelola</span>
          </p>
          <nav className="flex flex-col gap-1">
            {MENU_ADMIN.map((item) => (
              <ItemNavigasi key={item.to} {...item} />
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
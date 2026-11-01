import { NavLink } from 'react-router';
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
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-jeruk-50 text-jeruk-600'
            : 'text-kopi-600 hover:bg-garis/50 hover:text-kopi-900'
        }`
      }
    >
      <Icon className="size-5" strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-garis bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid size-9 place-items-center rounded-full bg-jeruk-500 text-white">
          <Coffee className="size-5" strokeWidth={2} />
        </span>
        <span className="text-lg font-extrabold tracking-tight">Kafe Senja</span>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU_UTAMA.map((item) => (
          <ItemNavigasi key={item.to} {...item} />
        ))}
      </nav>

      <p className="mt-8 mb-2 px-3 text-xs font-semibold text-kopi-400">Kelola</p>
      <nav className="flex flex-col gap-1">
        {MENU_ADMIN.map((item) => (
          <ItemNavigasi key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}
import { Search } from 'lucide-react';

export default function Header() {
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
          <p className="text-sm font-semibold">Admin</p>
          <p className="text-xs text-kopi-400">Pemilik</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-pastel-persik font-bold text-jeruk-600">
          A
        </span>
      </div>
    </header>
  );
}
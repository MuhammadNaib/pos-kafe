const WARNA_TAB = ['bg-pastel-persik', 'bg-pastel-hijau', 'bg-pastel-ungu', 'bg-pastel-kuning', 'bg-pastel-merah'];

export default function CategoryTabs({ categories, value, onChange }) {
  const pilihan = [{ id: '', name: 'Semua' }, ...categories];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Kategori menu">
      {pilihan.map((category, index) => {
        const aktif = category.id === value;
        const warna = WARNA_TAB[index % WARNA_TAB.length];

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={() => onChange(category.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              aktif ? 'bg-jeruk-500 text-white shadow-sm shadow-jeruk-500/30' : `${warna} text-kopi-900 hover:brightness-95`
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
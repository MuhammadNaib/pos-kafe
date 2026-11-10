import { useEffect, useReducer, useState } from 'react';
import { useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { cartReducer, hitungTotal } from '../lib/cart.js';
import CategoryTabs from '../components/kasir/CategoryTabs.jsx';
import MenuCard from '../components/kasir/MenuCard.jsx';
import CartPanel from '../components/kasir/CartPanel.jsx';
import CashPaymentModal from '../components/kasir/CashPaymentModal.jsx';
import Modal from '../components/ui/Modal.jsx';
import ReceiptModal from '../components/orders/ReceiptModal.jsx';


export default function KasirPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [kategori, setKategori] = useState('');
  const [keranjang, dispatch] = useReducer(cartReducer, []);
  const [searchParams] = useSearchParams();
  const kataKunci = (searchParams.get('q') ?? '').trim();
  const [bayarTerbuka, setBayarTerbuka] = useState(false);
    const [struk, setStruk] = useState(null);

  async function muatData() {
    try {
      const [dataMenu, dataKategori] = await Promise.all([api('/menus'), api('/categories')]);
      setMenus(dataMenu);
      setCategories(dataKategori);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

    const menuTampil = menus.filter(
    (menu) =>
      (kategori === '' || menu.category.id === kategori) && menu.name.toLowerCase().includes(kataKunci.toLowerCase()),
  );

    async function bayarTunai(cashPaid) {
    const order = await api('/orders', {
      method: 'POST',
      body: {
        items: keranjang.map((item) => ({ menuId: item.menuId, quantity: item.quantity })),
        paymentMethod: 'CASH',
        cashPaid,
      },
    });

    dispatch({ type: 'kosongkan' });
    setBayarTerbuka(false);
    setStruk(order);
    toast.success(`Pesanan ${order.code} lunas`);
  }

  function jumlahDiKeranjang(menuId) {
    return keranjang.find((item) => item.menuId === menuId)?.quantity ?? 0;
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section>
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Kasir</h1>
          <p className="mt-1 text-kopi-600">Ketuk menu untuk menambahkannya ke pesanan.</p>
        </div>

        <CategoryTabs categories={categories} value={kategori} onChange={setKategori} />

        <div className="mt-5">
          {status === 'loading' && <p className="text-kopi-600">Memuat menu…</p>}

          {status === 'error' && (
            <div className="rounded-2xl border border-garis bg-white p-6">
              <p className="font-semibold">Menu gagal dimuat.</p>
              <p className="mt-1 text-sm text-kopi-600">Pastikan server backend menyala, lalu coba lagi.</p>
              <button
                type="button"
                onClick={() => {
                  setStatus('loading');
                  muatData();
                }}
                className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50"
              >
                Coba lagi
              </button>
            </div>
          )}

          {status === 'ready' && menuTampil.length === 0 && (
            <div className="rounded-2xl border border-dashed border-garis bg-white p-10 text-center">
              <p className="font-semibold">
                {kataKunci ? `Tidak ada menu yang cocok dengan "${kataKunci}".` : 'Tidak ada menu di sini.'}
              </p>
              <p className="mt-1 text-sm text-kopi-600">
                {kataKunci
                  ? 'Periksa ejaannya, atau pilih kategori "Semua".'
                  : 'Pilih kategori lain, atau tambahkan menu di halaman Menu.'}
              </p>
            </div>
          )}

          {status === 'ready' && menuTampil.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-4">
              {menuTampil.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  jumlahDiKeranjang={jumlahDiKeranjang(menu.id)}
                  onTambah={(dipilih) => dispatch({ type: 'tambah', menu: dipilih })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CartPanel items={keranjang} dispatch={dispatch} onBayar={() => setBayarTerbuka(true)} />

      <Modal open={bayarTerbuka} title="Bayar tunai" onClose={() => setBayarTerbuka(false)}>
        <CashPaymentModal
          total={hitungTotal(keranjang)}
          onSubmit={bayarTunai}
          onCancel={() => setBayarTerbuka(false)}
        />
      </Modal>

      <ReceiptModal order={struk} onClose={() => setStruk(null)} closeLabel="Pesanan baru" />
    </div>
  );
}
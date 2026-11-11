import { useEffect, useState } from 'react';
import { Receipt as IkonStruk } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { formatJam, formatRupiah } from '../lib/format.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ReceiptModal from '../components/orders/ReceiptModal.jsx';

function tanggalHariIni() {
  const sekarang = new Date();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
  const tanggal = String(sekarang.getDate()).padStart(2, '0');
  return `${sekarang.getFullYear()}-${bulan}-${tanggal}`;
}

export default function RiwayatPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const [tanggal, setTanggal] = useState(tanggalHariIni);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [struk, setStruk] = useState(null);

  async function muatRiwayat() {
    const params = new URLSearchParams({
      from: new Date(`${tanggal}T00:00:00`).toISOString(),
      to: new Date(`${tanggal}T23:59:59.999`).toISOString(),
    });

    try {
      setOrders(await api(`/orders?${params}`));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (tanggal) muatRiwayat();
  }, [tanggal]);

  async function bukaStruk(id) {
    try {
      setStruk(await api(`/orders/${id}`));
    } catch (error) {
      toast.error(error.message);
    }
  }

  const omzet = orders.reduce((jumlah, order) => jumlah + order.total, 0);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat transaksi</h1>
          <p className="mt-1 text-kopi-600">
            {isAdmin ? 'Semua transaksi di kafe.' : 'Transaksi yang Anda layani.'} Klik baris untuk melihat struk.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Tanggal
          <input
            type="date"
            value={tanggal}
            max={tanggalHariIni()}
            onChange={(event) => setTanggal(event.target.value)}
            className="rounded-xl bg-white px-4 py-2.5 font-normal ring-1 ring-garis outline-none focus:ring-2 focus:ring-jeruk-500"
          />
        </label>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-pastel-hijau px-6 py-5">
          <p className="text-sm text-kopi-600">Jumlah transaksi</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{status === 'ready' ? orders.length : '–'}</p>
        </div>
        <div className="rounded-3xl bg-pastel-persik px-6 py-5">
          <p className="text-sm text-kopi-600">Omzet</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{status === 'ready' ? formatRupiah(omzet) : '–'}</p>
        </div>
      </div>

      {status === 'loading' && <p className="text-kopi-600">Memuat riwayat…</p>}

      {status === 'error' && (
        <div className="rounded-2xl border border-garis bg-white p-6">
          <p className="font-semibold">Riwayat gagal dimuat.</p>
          <p className="mt-1 text-sm text-kopi-600">Pastikan server backend menyala, lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => {
              setStatus('loading');
              muatRiwayat();
            }}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-jeruk-600 ring-1 ring-jeruk-100 hover:bg-jeruk-50"
          >
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-garis bg-white p-10 text-center">
          <p className="font-semibold">Belum ada transaksi di tanggal ini.</p>
          <p className="mt-1 text-sm text-kopi-600">Pilih tanggal lain di kanan atas.</p>
        </div>
      )}

      {status === 'ready' && orders.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-garis bg-white">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-garis text-kopi-400">
              <tr>
                <th className="px-5 py-3 font-medium">No. pesanan</th>
                <th className="px-5 py-3 font-medium">Jam</th>
                {isAdmin && <th className="px-5 py-3 font-medium">Kasir</th>}
                <th className="px-5 py-3 text-right font-medium">Item</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {orders.map((order) => (
                <tr key={order.id} onClick={() => bukaStruk(order.id)} className="cursor-pointer hover:bg-latar">
                  <td className="px-5 py-3 font-semibold">{order.code}</td>
                  <td className="px-5 py-3 tabular-nums">{formatJam(order.createdAt)}</td>
                  {isAdmin && <td className="px-5 py-3">{order.cashier.name}</td>}
                  <td className="px-5 py-3 text-right tabular-nums">{order.itemCount}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatRupiah(order.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        bukaStruk(order.id);
                      }}
                      aria-label={`Lihat struk ${order.code}`}
                      className="inline-grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-white hover:text-jeruk-600"
                    >
                      <IkonStruk className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReceiptModal order={struk} onClose={() => setStruk(null)} />
    </section>
  );
}
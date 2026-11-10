import { formatRupiah, formatWaktu } from '../../lib/format.js';

function Baris({ label, nilai, tebal = false }) {
  return (
    <div className={`flex justify-between gap-2 ${tebal ? 'font-bold' : ''}`}>
      <span>{label}</span>
      <span className="tabular-nums">{nilai}</span>
    </div>
  );
}

export default function Receipt({ order }) {
  return (
    <div className="mx-auto w-[58mm] bg-white px-3 py-4 font-mono text-[11px] leading-relaxed text-black">
      <div className="text-center">
        <p className="text-sm font-bold">KAFE SENJA</p>
        <p>Struk Pembayaran</p>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <Baris label="No." nilai={order.code} />
      <Baris label="Waktu" nilai={formatWaktu(order.createdAt)} />
      <Baris label="Kasir" nilai={order.cashier.name} />

      <div className="my-2 border-t border-dashed border-black" />

      {order.items.map((item) => (
        <div key={item.id} className="mb-1">
          <p>{item.menuName}</p>
          <Baris
            label={`${item.quantity} x ${item.price.toLocaleString('id-ID')}`}
            nilai={item.subtotal.toLocaleString('id-ID')}
          />
        </div>
      ))}

      <div className="my-2 border-t border-dashed border-black" />

      <Baris label="TOTAL" nilai={formatRupiah(order.total)} tebal />
      {order.paymentMethod === 'CASH' && (
        <>
          <Baris label="Tunai" nilai={formatRupiah(order.cashPaid)} />
          <Baris label="Kembalian" nilai={formatRupiah(order.change)} />
        </>
      )}

      <div className="my-2 border-t border-dashed border-black" />

      <p className="text-center">Terima kasih atas kunjungan Anda</p>
    </div>
  );
}
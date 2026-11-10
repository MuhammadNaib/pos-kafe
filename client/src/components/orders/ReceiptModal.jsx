import { Printer } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Receipt from './Receipt.jsx';

export default function ReceiptModal({ order, onClose, closeLabel = 'Tutup' }) {
  return (
    <Modal open={order !== null} title="Struk" onClose={onClose} size="max-w-sm">
      {order && (
        <>
          <div className="area-cetak rounded-2xl bg-latar py-4 ring-1 ring-garis">
            <Receipt order={order} />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-kopi-600 hover:bg-latar"
            >
              {closeLabel}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              data-autofocus
              className="flex items-center gap-2 rounded-xl bg-jeruk-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-jeruk-600"
            >
              <Printer className="size-4" />
              Cetak struk
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
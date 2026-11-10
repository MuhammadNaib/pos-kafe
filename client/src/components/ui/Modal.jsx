import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, size = 'max-w-md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('[data-autofocus]')?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
            className={`m-auto w-full ${size} rounded-3xl bg-white p-6 text-kopi-900 shadow-xl backdrop:bg-kopi-900/40`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="grid size-9 place-items-center rounded-full text-kopi-600 hover:bg-latar"
        >
          <X className="size-5" />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
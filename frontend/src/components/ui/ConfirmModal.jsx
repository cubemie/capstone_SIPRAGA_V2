import { useEffect } from 'react';

const ConfirmModal = ({
  isOpen,
  title,
  children,
  confirmLabel = 'Konfirmasi',
  confirmClass = 'bg-red-600 hover:bg-red-700 text-white',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div className="flex items-start justify-between mb-4">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            aria-label="Tutup modal"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
          >
            ✕
          </button>
        </div>
        <div className="mb-5">{children}</div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

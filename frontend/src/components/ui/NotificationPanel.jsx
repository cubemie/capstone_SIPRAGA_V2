import { useState, useEffect } from 'react';
import { suratService } from '../../services';
import StatusBadge from './StatusBadge';

// Formats a datetime string to a short Indonesian date
const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    suratService
      .getSuratSaya()
      .then((data) => {
        // Show the 10 most recent letters as notification feed
        const sorted = [...(data.data ?? data)].sort(
          (a, b) => new Date(b.tanggal_ajuan) - new Date(a.tanggal_ajuan)
        );
        setItems(sorted.slice(0, 10));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Panel notifikasi"
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#0F2D5C]">
          <h2 className="text-base font-semibold text-white">Notifikasi</h2>
          <button
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="text-white/70 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <span className="text-4xl">🔔</span>
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-1">
                      {item.subjek}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-gray-400">{fmt(item.tanggal_ajuan)}</p>
                  {item.status === 3 && item.alasan_penolakan && (
                    <p className="text-xs text-red-600 mt-1 line-clamp-2">
                      Alasan: {item.alasan_penolakan}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Notifikasi berdasarkan status surat Anda
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;

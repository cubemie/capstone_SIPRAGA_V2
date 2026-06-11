// frontend/src/pages/rtrw/Dashboard.jsx
// GET  /api/surat/menunggu-ttd
// POST /api/surat/tanda-tangani/:id
// POST /api/surat/tolak/:id

import { useEffect, useState } from 'react';
import { Clock, FileText, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export default function RTRWDashboard() {
  const [surat, setSurat]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]           = useState('');

  // ── Modal state untuk tolak ──────────────────────────
  const [rejectModal, setRejectModal]   = useState(false);
  const [rejectId, setRejectId]         = useState(null);
  const [alasan, setAlasan]             = useState('');
  const [rejectError, setRejectError]   = useState('');

  const fetchSurat = () => {
    setLoading(true);
    suratService.getMenungguTTD()
      .then(res => setSurat(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSurat(); }, []);

  // ── Approve ──────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    setError('');
    try {
      const fd = new FormData();
      await suratService.tandaTangani(id, fd);
      fetchSurat();
    } catch (err) {
      setError(err?.message || 'Gagal menyetujui surat. Coba lagi.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Buka modal tolak ─────────────────────────────────
  const openRejectModal = (id) => {
    setRejectId(id);
    setAlasan('');
    setRejectError('');
    setRejectModal(true);
  };

  const closeRejectModal = () => {
    if (actionLoading) return;
    setRejectModal(false);
    setRejectId(null);
    setAlasan('');
    setRejectError('');
  };

  // ── Submit tolak ─────────────────────────────────────
  const handleReject = async (e) => {
    e.preventDefault();
    if (!alasan.trim() || alasan.trim().length < 10) {
      setRejectError('Alasan penolakan minimal 10 karakter.');
      return;
    }
    setActionLoading(rejectId);
    setRejectError('');
    try {
      await suratService.tolakSurat(rejectId, alasan.trim());
      closeRejectModal();
      fetchSurat();
    } catch (err) {
      setRejectError(err?.message || 'Gagal menolak surat. Coba lagi.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Dashboard RT/RW"
        subtitle="Kelola permintaan surat dari warga yang menunggu tanda tangan Anda."
      />

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-start gap-2 bg-error/10 border border-error/20 text-error p-4 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-0.5 hover:bg-error/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={<Clock />}
          label="Menunggu Persetujuan"
          value={loading ? '...' : surat.length}
          colorClass="text-warning"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Surat Disetujui Hari Ini"
          value="—"
          colorClass="text-success"
        />
      </div>

      {/* Daftar surat */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <h2 className="text-base font-semibold text-gray-800">Antrean Surat Masuk</h2>
          {!loading && surat.length > 0 && (
            <span className="bg-warning/10 text-warning text-xs font-bold px-2.5 py-1 rounded-full">
              {surat.length} menunggu
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 h-16 bg-neutral-50 rounded-lg" />
            ))}
          </div>
        ) : surat.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-gray-300" />}
            title="Tidak Ada Surat Menunggu"
            description="Belum ada surat yang menunggu persetujuan Anda saat ini."
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {surat.map(s => (
              <div
                key={s.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">{s.nama_warga}</p>
                  <p className="text-xs text-gray-400 font-mono mb-1">NIK: {s.nik_warga}</p>
                  <p className="text-sm text-gray-800 font-medium truncate">{s.subjek}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Diajukan: {fmt(s.tanggal_ajuan || s.created_at)}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.file_path && (
                    <a
                      href={s.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-white border border-neutral-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Lihat Dokumen
                    </a>
                  )}
                  <button
                    onClick={() => openRejectModal(s.id)}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-error/10 hover:bg-error/20 text-error text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(s.id)}
                    disabled={!!actionLoading}
                    className="px-4 py-2 bg-success hover:bg-success/90 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                  >
                    {actionLoading === s.id ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Setujui & TTD</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Penolakan ── */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeRejectModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-error" />
                </div>
                <h2 className="font-bold text-gray-900">Tolak Surat</h2>
              </div>
              <button
                onClick={closeRejectModal}
                disabled={!!actionLoading}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-gray-400 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleReject} className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Berikan alasan penolakan yang jelas agar warga dapat melakukan perbaikan.
              </p>

              {rejectError && (
                <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
                  {rejectError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Alasan Penolakan <span className="text-error">*</span>
                </label>
                <textarea
                  value={alasan}
                  onChange={e => setAlasan(e.target.value)}
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Contoh: Dokumen yang diunggah tidak terbaca. Harap unggah ulang foto KTP yang lebih jelas."
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{alasan.length} karakter (min. 10)</p>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={!!actionLoading}
                  className="px-4 py-2 border border-neutral-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!!actionLoading || alasan.trim().length < 10}
                  className="px-5 py-2 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {actionLoading === rejectId ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Memproses...
                    </>
                  ) : 'Konfirmasi Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

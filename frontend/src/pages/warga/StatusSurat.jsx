// frontend/src/pages/warga/StatusSurat.jsx
// GET /api/surat/milik-saya

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { suratService } from '../../services';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: '1', label: 'Menunggu' },
  { key: '2', label: 'Disetujui' },
  { key: '3', label: 'Ditolak' },
];

const StatusSurat = () => {
  const [surat, setSurat] = useState([]);
  const [filter, setFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    suratService
      .getSuratSaya()
      .then((res) => {
        const list = res.data ?? res;
        setSurat([...list].sort((a, b) => new Date(b.tanggal_ajuan) - new Date(a.tanggal_ajuan)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'semua' ? surat : surat.filter((s) => String(s.status) === filter);

  return (
    <div>
      <PageHeader
        title="Status Surat"
        subtitle="Seluruh surat yang pernah Anda ajukan"
        actions={
          <Link
            to="/warga/buat-surat"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors"
          >
            + Buat Surat
          </Link>
        }
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key ? 'bg-primary text-white' : 'bg-white border border-neutral-100 text-secondary hover:border-primary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-3 bg-gray-200 rounded w-6" />
                <div className="h-3 bg-gray-200 rounded flex-1" />
                <div className="h-3 bg-neutral-50 rounded w-20" />
                <div className="h-3 bg-neutral-50 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-12 h-12 text-gray-300" />}
          title="Tidak ada surat"
          description="Tidak ada surat pada filter ini."
          action={
            <Link to="/warga/buat-surat" className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark">
              Buat Surat
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-neutral-100 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full" role="table" aria-label="Daftar surat">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['No', 'Jenis Surat', 'Tanggal', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} className={`border-b border-neutral-100 hover:bg-primary-light/10 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}>
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900 max-w-xs truncate">{s.subjek}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(s.tanggal_ajuan)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.file_path && (
                          <a href={s.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-light hover:underline">Lihat</a>
                        )}
                        {s.status === 2 && s.file_path_signed && (
                          <a href={s.file_path_signed} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-success hover:underline">↓ Unduh</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white border border-neutral-100 rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{s.subjek}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt(s.tanggal_ajuan)}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0"><StatusBadge status={s.status} /></div>
                </button>
                {expanded === s.id && (
                  <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50 space-y-2">
                    {s.status === 3 && s.alasan_penolakan && (
                      <div className="bg-error/10 border border-error/20 text-error p-2.5 rounded text-xs">
                        <span className="font-semibold">Alasan: </span>{s.alasan_penolakan}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {s.file_path && (
                        <a href={s.file_path} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-white">Lihat Dokumen</a>
                      )}
                      {s.status === 2 && s.file_path_signed && (
                        <a href={s.file_path_signed} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-success text-white rounded text-xs hover:bg-success/90">↓ Unduh Surat TTD</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusSurat;
// frontend/src/pages/rtrw/RiwayatSurat.jsx
// GET /api/surat/riwayat-rtrw

import { useEffect, useState } from 'react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList, ChevronDown } from 'lucide-react';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export default function RiwayatSurat() {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]     = useState('semua');

  useEffect(() => {
    suratService.getRiwayatRTRW()
      .then(res => {
        const list = res.data ?? res;
        setHistory(
          [...list].sort(
            (a, b) =>
              new Date(b.tanggal_ajuan || b.created_at) -
              new Date(a.tanggal_ajuan || a.created_at)
          )
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'semua'
      ? history
      : history.filter(h => String(h.status) === filter);

  const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: '2',     label: 'Disetujui' },
    { key: '3',     label: 'Ditolak' },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Riwayat Surat"
        subtitle="Seluruh surat yang telah selesai diproses (Disetujui / Ditolak)."
      />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-secondary hover:border-primary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex h-12 bg-neutral-50 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-12 h-12 text-gray-300" />}
            title="Tidak ada riwayat"
            description="Belum ada surat yang telah diproses pada filter ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['Tanggal', 'Warga', 'Jenis Surat', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, idx) => (
                  <>
                    <tr
                      key={h.id}
                      className={`border-b border-neutral-100 hover:bg-primary/5 transition-colors cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                      }`}
                      onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                    >
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {fmt(h.tanggal_ajuan || h.created_at)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-neutral-900">
                        {h.nama_warga}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 max-w-[200px]">
                        <p className="truncate">{h.jenis_surat || h.subjek}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={h.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <ChevronDown className={`w-4 h-4 transition-transform ${expanded === h.id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded === h.id && (
                      <tr key={`${h.id}-expand`} className="bg-neutral-50/80">
                        <td colSpan={5} className="px-5 py-4 border-b border-neutral-100">
                          <div className="space-y-3">
                            {/* Alasan penolakan */}
                            {h.status === 3 && (h.alasan_penolakan || h.alasan) && (
                              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
                                <p className="font-semibold mb-0.5">Alasan Penolakan:</p>
                                <p>{h.alasan_penolakan || h.alasan}</p>
                              </div>
                            )}

                            {/* Links */}
                            <div className="flex gap-2 flex-wrap">
                              {(h.file_path) && (
                                <a
                                  href={h.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-white transition-colors"
                                >
                                  Dokumen Asli
                                </a>
                              )}
                              {h.status === 2 && h.file_path_signed && (
                                <a
                                  href={h.file_path_signed}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg text-xs font-medium hover:bg-success/90 transition-colors"
                                >
                                  ↓ Unduh Surat TTD
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-xs text-gray-400">
              {filtered.length} surat ditampilkan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

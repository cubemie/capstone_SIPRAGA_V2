// frontend/src/pages/superadmin/suratmanual.jsx
// GET /api/surat/semua — global monitoring semua surat oleh superadmin

import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { superadminService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const STATUS_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: '1',     label: 'Menunggu' },
  { key: '2',     label: 'Disetujui' },
  { key: '3',     label: 'Ditolak' },
];

export default function SuratManual() {
  const [surat, setSurat]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('semua');
  const [search, setSearch]   = useState('');

  const fetchAll = () => {
    setLoading(true);
    setError('');
    superadminService.getAllSurat()
      .then(res => setSurat(res.data ?? res))
      .catch(err => setError(err?.message || 'Gagal memuat data surat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // Hitung statistik dari data
  const stats = {
    total:    surat.length,
    menunggu: surat.filter(s => s.status === 1).length,
    disetujui:surat.filter(s => s.status === 2).length,
    ditolak:  surat.filter(s => s.status === 3).length,
  };

  // Filter + search
  const filtered = surat
    .filter(s => filter === 'semua' || String(s.status) === filter)
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.nama_warga?.toLowerCase().includes(q) ||
        s.nik_warga?.toLowerCase().includes(q) ||
        s.subjek?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Monitoring Surat"
        subtitle="Pantau seluruh pengajuan surat dari semua warga di sistem"
        actions={
          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />}    label="Total Surat"  value={loading ? '...' : stats.total}     colorClass="text-primary" />
        <StatCard icon={<Clock />}       label="Menunggu"     value={loading ? '...' : stats.menunggu}   colorClass="text-warning" />
        <StatCard icon={<CheckCircle />} label="Disetujui"    value={loading ? '...' : stats.disetujui} colorClass="text-success" />
        <StatCard icon={<XCircle />}     label="Ditolak"      value={loading ? '...' : stats.ditolak}   colorClass="text-error" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ key, label }) => (
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

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Cari nama, NIK, jenis surat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Tabel ── */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 h-10 bg-neutral-50 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-gray-300" />}
            title="Tidak ada surat"
            description={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada pengajuan surat di sistem.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['No', 'Warga', 'Jenis Surat', 'RT/RW', 'Tanggal', 'Status', 'Dokumen'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-primary/5 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-400 w-10">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-neutral-900">{s.nama_warga}</p>
                      <p className="text-xs text-gray-400 font-mono">{s.nik_warga}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                      <p className="truncate">{s.subjek}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {s.rt && s.rw ? `RT ${s.rt} / RW ${s.rw}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {fmt(s.tanggal_ajuan)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.file_path && (
                          <a
                            href={s.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-light hover:underline font-medium whitespace-nowrap"
                          >
                            Lihat
                          </a>
                        )}
                        {s.status === 2 && s.file_path_signed && (
                          <a
                            href={s.file_path_signed}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-success hover:underline font-medium whitespace-nowrap"
                          >
                            ↓ TTD
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 text-xs text-gray-500">
              Menampilkan {filtered.length} dari {surat.length} surat
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

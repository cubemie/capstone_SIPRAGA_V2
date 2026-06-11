// frontend/src/pages/warga/AjukanTTD.jsx
// GET /api/surat/milik-saya

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Info, FileSignature, CheckCircle, XCircle, FileText } from 'lucide-react';
import { suratService } from '../../services';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const AjukanTTD = () => {
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
    filter === 'semua'
      ? surat
      : surat.filter(
          (s) =>
            (filter === 'menunggu' && s.status === 1) ||
            (filter === 'disetujui' && s.status === 2) ||
            (filter === 'ditolak' && s.status === 3)
        );

  const pending = surat.filter((s) => s.status === 1).length;

  const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'menunggu', label: 'Menunggu' },
    { key: 'disetujui', label: 'Disetujui' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

  return (
    <div>
      <PageHeader
        title="Ajukan TTD"
        subtitle="Pantau surat yang menunggu tanda tangan dari RT/RW"
        actions={
          <Link
            to="/warga/buat-surat"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors"
          >
            + Buat Surat Baru
          </Link>
        }
      />

      {!loading && pending > 0 && (
        <div className="bg-warning/10 border border-warning/20 text-warning p-4 rounded-lg mb-5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          <p className="text-sm">
            <span className="font-semibold">{pending} surat</span> sedang menunggu tanda tangan dari pengurus RT/RW.
          </p>
        </div>
      )}

      <div className="bg-primary-light/10 border border-blue-100 rounded-lg p-4 mb-5">
        <p className="text-sm text-primary-dark font-medium mb-1 flex items-center gap-1.5"><Info className="w-4 h-4"/> Cara Kerja TTD</p>
        <ol className="text-xs text-primary space-y-1 list-decimal list-inside">
          <li>Buat surat melalui menu <strong>Buat Surat</strong></li>
          <li>Surat otomatis masuk ke antrian TTD RT/RW wilayah Anda</li>
          <li>RT/RW akan menandatangani dan mengunggah surat yang sudah di-TTD</li>
          <li>Unduh surat yang sudah ditandatangani di sini setelah status <strong>Disetujui</strong></li>
        </ol>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-white border border-neutral-100 text-secondary hover:border-primary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-lg p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="w-12 h-12 text-gray-300" />}
          title="Tidak ada surat"
          description="Belum ada surat pada kategori ini."
          action={
            <Link
              to="/warga/buat-surat"
              className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark"
            >
              Buat Surat Baru
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white border border-neutral-100 rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
                    {s.status === 2 ? <CheckCircle className="w-5 h-5 text-success" /> : s.status === 3 ? <XCircle className="w-5 h-5 text-error" /> : <FileText className="w-5 h-5 text-secondary" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 text-sm leading-snug truncate">{s.subjek}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Diajukan {fmt(s.tanggal_ajuan)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <StatusBadge status={s.status} />
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expanded === s.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expanded === s.id && (
                <div className="border-t border-neutral-100 px-5 py-4 bg-neutral-50">
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                    {[
                      ['RT / RW', `${s.rt ?? '—'} / ${s.rw ?? '—'}`],
                      ['Kecamatan', s.kecamatan ?? '—'],
                      ['Kelurahan', s.kelurahan ?? '—'],
                      ['Kota', s.kota ?? '—'],
                    ].map(([dt, dd]) => (
                      <div key={dt}>
                        <dt className="text-xs text-gray-400 mb-0.5">{dt}</dt>
                        <dd className="font-medium text-gray-800">{dd}</dd>
                      </div>
                    ))}
                  </dl>

                  {s.status === 3 && s.alasan_penolakan && (
                    <div className="bg-error/10 border border-error/20 text-error p-3 rounded mb-3">
                      <p className="text-xs font-semibold mb-0.5">Alasan Penolakan:</p>
                      <p className="text-sm">{s.alasan_penolakan}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {s.file_path && (
                      <a href={s.file_path} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-white transition-colors">
                        ↓ Dokumen Asli
                      </a>
                    )}
                    {s.status === 2 && s.file_path_signed && (
                      <a href={s.file_path_signed} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-success hover:bg-success/90 text-white rounded text-xs font-medium transition-colors">
                        ↓ Unduh Surat Bertanda Tangan
                      </a>
                    )}
                    {s.status === 3 && (
                      <Link to="/warga/buat-surat"
                        className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-medium transition-colors">
                        Ajukan Ulang
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AjukanTTD;
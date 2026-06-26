import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { lettersService } from '../../services/lettersService';
import { useAuth } from '../../context/AuthContext';

const STATUS_PENDING = ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw'];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const map = {
    submitted:    { label: 'Menunggu RT',   cls: 'bg-amber-50 text-amber-700' },
    in_review_rt: { label: 'Diproses RT',   cls: 'bg-blue-50 text-blue-700' },
    approved_rt:  { label: 'Menunggu RW',   cls: 'bg-cyan-50 text-cyan-700' },
    in_review_rw: { label: 'Diproses RW',   cls: 'bg-indigo-50 text-indigo-700' },
    completed:    { label: 'Selesai',        cls: 'bg-emerald-50 text-emerald-700' },
    rejected:     { label: 'Ditolak',        cls: 'bg-rose-50 text-rose-700' },
    revision_requested: { label: 'Revisi',  cls: 'bg-orange-50 text-orange-700' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
  );
}

export default function RtRwDashboard() {
  const { user } = useAuth();

  const { data: inbox = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inbox-rtrw'],
    queryFn: lettersService.getInbox,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const pendingCount = inbox.filter(l => STATUS_PENDING.includes(l.status)).length;
  const totalCount   = inbox.length;

  return (
    <div className="p-4 md:p-0 space-y-6 w-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          Dashboard {user?.role?.includes('rw') ? 'RW' : 'RT'}
        </h1>
        <p className="text-sm text-[var(--color-ink-secondary)] mt-1">Ringkasan pengajuan surat masuk</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface-card)] p-5 rounded-2xl border border-[var(--color-surface-border)] shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[var(--color-ink-secondary)] font-medium block">Butuh Verifikasi</span>
            <p className="text-xl font-bold text-[var(--color-ink)]">{isLoading ? '—' : pendingCount}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface-card)] p-5 rounded-2xl border border-[var(--color-surface-border)] shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[var(--color-ink-secondary)] font-medium block">Total Masuk</span>
            <p className="text-xl font-bold text-[var(--color-ink)]">{isLoading ? '—' : totalCount}</p>
          </div>
        </div>
      </div>

      {/* Surat Masuk */}
      <div className="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-surface-border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-surface-border)] flex justify-between items-center bg-[var(--color-surface)]">
          <div>
            <h4 className="font-bold text-[var(--color-ink)] text-sm">Surat Masuk</h4>
            <p className="text-xs text-[var(--color-ink-secondary)] mt-0.5">
              {user?.role === 'rw'
                ? 'TTD digital tersimpan akan dipakai otomatis saat persetujuan final.'
                : 'Persetujuan RT akan meneruskan surat ke RW untuk persetujuan final.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                {pendingCount} pending
              </span>
            )}
            <Link
              to="/rtrw/inbox"
              className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 font-medium"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-[var(--color-ink-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat surat masuk...</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="m-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Gagal memuat: {error.message}</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && inbox.length === 0 && (
          <div className="py-16 text-center text-[var(--color-ink-muted)] text-sm">
            Tidak ada surat yang membutuhkan verifikasi saat ini.
          </div>
        )}

        {/* List — tampilkan 5 terbaru, link ke detail untuk approve/reject */}
        {!isLoading && !error && inbox.length > 0 && (
          <div className="divide-y divide-slate-100">
            {inbox.slice(0, 5).map((letter) => (
              <Link
                key={letter.uuid}
                to={`/rtrw/surat/${letter.uuid}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--color-surface)]/50 transition block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{letter.resident_name}</span>
                    {letter.resident_nik && (
                      <span className="text-xs text-[var(--color-ink-muted)]">NIK: {letter.resident_nik}</span>
                    )}
                  </div>
                  <p className="text-[var(--color-ink)] font-medium text-sm flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[var(--color-ink-muted)] flex-shrink-0" />
                    {letter.letter_type_name || '-'}
                  </p>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {formatDate(letter.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={letter.status} />
                  <span className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-0.5">
                    Proses <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

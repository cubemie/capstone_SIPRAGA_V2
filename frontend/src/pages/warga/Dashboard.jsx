import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Plus, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import ProfileWarningBanner from '../../components/ui/ProfileWarningBanner';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WargaDashboard() {
  // Fetch profile for profile warning
  const { data: profile } = useQuery({
    queryKey: ['warga-profile'],
    queryFn: async () => {
      const res = await api.get('/warga/profile');
      return res.data?.data || res.data;
    },
    retry: false,
  });

  const REQUIRED_PROFILE_FIELDS = ['no_hp', 'NIK', 'alamat', 'tanggal_lahir'];
  const missingFields = profile
    ? REQUIRED_PROFILE_FIELDS.filter(f => !profile[f] || String(profile[f]).trim() === '')
    : [];

  const { data: suratList = [], isLoading: loading } = useQuery({
    queryKey: ['my-v2-letters'],
    queryFn: async () => {
      const res = await api.get('/v2/letters');
      if (res.error) throw new Error(res.error);
      return res.data?.data || [];
    },
    staleTime: 60 * 1000, // Sinkron cache dengan LetterListPage
    retry: false
  });

  const pending  = suratList.filter(s => ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw'].includes(s.status)).length;
  const approved = suratList.filter(s => s.status === 'completed').length;
  const rejected = suratList.filter(s => ['rejected', 'cancelled'].includes(s.status)).length;
  const recentSurat = suratList.slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-[var(--color-surface-muted)] text-[var(--color-ink)]">Draft</span>;
      case 'submitted':
      case 'in_review_rt':
      case 'approved_rt':
      case 'in_review_rw': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200 bg-amber-50 text-amber-700">Diproses</span>;
      case 'completed': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700">Selesai</span>;
      case 'rejected':
      case 'cancelled': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-rose-50 text-rose-700">Ditolak</span>;
      default: return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-[var(--color-surface-muted)] text-[var(--color-ink)]">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-0 space-y-6 w-full">
      {/* Profile Warning Banner */}
      {missingFields.length > 0 && (
        <ProfileWarningBanner missingFields={missingFields} />
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Butuh Surat Pengantar RT/RW?</h3>
          <p className="text-blue-200 text-sm max-w-xl">
            Ajukan surat pengantar resmi secara digital. Proses verifikasi langsung dipantau oleh ketua RT &amp; RW (Sistem V2).
          </p>
        </div>
        <Link
          to="/warga/buat-surat-v2"
          className="bg-[var(--color-surface-card)] text-[var(--color-primary)] px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-brand-50)] transition shadow text-sm self-start md:self-auto whitespace-nowrap inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajukan Surat Baru
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Sedang Diproses', value: pending,  icon: Clock,        bg: 'bg-amber-50',   color: 'text-amber-700' },
          { label: 'Selesai / Disetujui',  value: approved, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Pengajuan Ditolak',    value: rejected, icon: XCircle,      bg: 'bg-rose-50',    color: 'text-rose-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-[var(--color-surface-card)] p-5 rounded-2xl border border-[var(--color-surface-border)] shadow-sm flex items-center space-x-4">
            <div className={`p-3 ${bg} ${color} rounded-xl`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--color-ink-secondary)] font-medium">{label}</span>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Letters */}
      <div className="bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-surface-border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-surface-border)] flex justify-between items-center bg-[var(--color-surface)]">
          <h4 className="font-bold text-[var(--color-ink)] text-sm">Status Pengajuan Terakhir</h4>
          <Link to="/warga/riwayat" className="text-xs text-[var(--color-primary)] font-bold hover:underline">
            <span className="inline-flex items-center gap-1">
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[var(--color-ink-muted)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Memuat data surat...</span>
            </div>
          ) : recentSurat.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-ink-muted)] text-sm">
              Belum ada pengajuan surat.{' '}
              <Link to="/warga/buat-surat-v2" className="text-[var(--color-primary)] font-semibold hover:underline">
                Ajukan sekarang
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[var(--color-ink-secondary)]">
              <thead className="bg-[var(--color-surface)] text-slate-600 uppercase font-semibold text-xs border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Jenis Surat</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSurat.map((s) => (
                  <tr key={s.uuid} className="hover:bg-[var(--color-surface)]/60 transition">
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-[var(--color-ink)]">
                      <Link to={`/warga/surat/${s.uuid}`} className="hover:text-[var(--color-primary)] hover:underline">
                        {formatDate(s.created_at)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/warga/surat/${s.uuid}`} className="hover:text-[var(--color-primary)] hover:underline">
                        {s.letter_type_name || '-'}
                      </Link>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Link to={`/warga/surat/${s.uuid}`}>
                        {getStatusBadge(s.status)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

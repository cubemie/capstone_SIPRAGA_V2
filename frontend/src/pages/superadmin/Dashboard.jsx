// frontend/src/pages/superadmin/Dashboard.jsx
// GANTI SELURUH ISI

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users, MapPin, FileText, Building2,
  ChevronRight, ArrowLeft, BarChart3, UserCheck,
} from 'lucide-react';

const formatNum = (n) => (n ?? 0).toLocaleString('id-ID');

// ─── Komponen: Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  const COLORS = {
    brand:  { bg: 'bg-brand-50',   text: 'text-brand-600',   border: 'border-brand-100' },
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
    purple: { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100' },
  };
  const c = COLORS[color] || COLORS.brand;

  return (
    <div className={`bg-[var(--color-surface-card)] border ${c.border} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{formatNum(value)}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

// ─── Komponen: Detail Warga per RW ───────────────────────────────────────────
function RWDetailPanel({ rwId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['warga-stats', rwId],
    queryFn: async () => {
      const { data, error } = await api.get(`/superadmin/stats/warga/${rwId}`);
      if (error) throw new Error(error);
      return data?.data;
    },
    enabled: !!rwId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (!data) return null;

  const jenisKelamin = data.jenis_kelamin_distribution || [];
  const laki   = jenisKelamin.find(j => j.jenis_kelamin === 'Laki-laki')?.jumlah ?? 0;
  const perempuan = jenisKelamin.find(j => j.jenis_kelamin === 'Perempuan')?.jumlah ?? 0;

  return (
    <div className="space-y-4">
      <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink">
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke daftar RW
      </button>

      <div>
        <h2 className="text-lg font-bold text-ink">RW {data.rw?.no_rw}</h2>
        <p className="text-sm text-ink-secondary">{data.rw?.kelurahan_desa}</p>
        <p className="text-xs text-ink-muted mt-0.5">Ketua: {data.rw?.nama_ketua}</p>
      </div>

      {/* Stat utama */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}     label="Total Warga"  value={data.total_warga}         color="brand" />
        <StatCard icon={UserCheck} label="Kepala KK*"   value={data.kepala_keluarga_est} color="green" />
        <StatCard icon={MapPin}    label="Jumlah RT"    value={data.rt_list?.length}      color="amber" />
        <StatCard icon={BarChart3} label="Est. Sarjana" value={data.sarjana_est}          color="purple" />
      </div>

      {/* Jenis kelamin */}
      <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-4">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
          Distribusi Jenis Kelamin
        </p>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-secondary">Laki-laki</span>
              <span className="font-semibold text-ink">{formatNum(laki)}</span>
            </div>
            <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${data.total_warga ? (laki / data.total_warga) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-secondary">Perempuan</span>
              <span className="font-semibold text-ink">{formatNum(perempuan)}</span>
            </div>
            <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-400 rounded-full"
                style={{ width: `${data.total_warga ? (perempuan / data.total_warga) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pekerjaan top 5 */}
      <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-4">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
          Distribusi Pekerjaan (Top 5)
        </p>
        <div className="space-y-2">
          {(data.pekerjaan_distribution || []).slice(0, 5).map((p) => (
            <div key={p.pekerjaan} className="flex items-center gap-2">
              <span className="text-xs text-ink-secondary w-32 truncate">{p.pekerjaan || 'Tidak diisi'}</span>
              <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${data.total_warga ? (p.jumlah / data.total_warga) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-ink w-8 text-right">{p.jumlah}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar RT */}
      <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-4">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
          Daftar RT
        </p>
        <div className="space-y-2">
          {(data.rt_list || []).map((rt) => (
            <div key={rt.rt_id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
              <div>
                <p className="text-sm font-medium text-ink">RT {rt.no_rt}</p>
                <p className="text-xs text-ink-muted">Ketua: {rt.nama_ketua}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">{formatNum(rt.jumlah_warga)}</p>
                <p className="text-xs text-ink-muted">warga</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-muted">* Estimasi kepala keluarga = warga kawin ÷ 2</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SuperadminDashboard() {
  const [selectedRwId, setSelectedRwId] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['superadmin-dashboard'],
    queryFn: async () => {
      const { data, error } = await api.get('/superadmin/dashboard');
      if (error) throw new Error(error);
      return data?.data;
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Dashboard Superadmin</h1>
          <p className="text-sm text-ink-secondary mt-0.5">Ringkasan data seluruh wilayah</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats global */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Users}     label="Total Warga"      value={stats?.total_warga}  color="brand" />
              <StatCard icon={Building2} label="Total RT"         value={stats?.total_rt}     color="green" />
              <StatCard icon={MapPin}    label="Total RW"         value={stats?.total_rw}     color="amber" />
              <StatCard icon={FileText}  label="Surat Selesai"    value={stats?.surat_selesai} color="purple" />
            </div>

            {/* Detail per RW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daftar RW */}
              {!selectedRwId && (
                <div className="md:col-span-2 bg-[var(--color-surface-card)] border border-surface-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-surface-border">
                    <h2 className="text-sm font-semibold text-ink">Daftar Wilayah RW</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Klik RW untuk melihat detail data warga
                    </p>
                  </div>
                  {(stats?.rw_list || []).map((rw) => (
                    <button
                      key={rw.rw_id}
                      onClick={() => setSelectedRwId(rw.rw_id)}
                      className="w-full flex items-center gap-4 px-5 py-4 border-b border-surface-border hover:bg-surface-muted/50 transition group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-brand-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">RW {rw.no_rw}</p>
                        <p className="text-xs text-ink-secondary">{rw.kelurahan_desa}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {formatNum(rw.jumlah_rt)} RT · {formatNum(rw.jumlah_warga)} warga
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rw.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                        }`}>
                          {rw.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Detail RW */}
              {selectedRwId && (
                <div className="md:col-span-2">
                  <RWDetailPanel rwId={selectedRwId} onClose={() => setSelectedRwId(null)} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

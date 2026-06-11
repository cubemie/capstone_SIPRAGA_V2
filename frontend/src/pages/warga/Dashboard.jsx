import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { suratService, wargaService } from '../../services';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';

const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSurat, setRecentSurat] = useState([]);
  const [dataLengkap, setDataLengkap] = useState(true);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      suratService.getStatistik(),
      suratService.getSuratSaya(),
      wargaService.checkKelengkapan(),
    ])
      .then(([statRes, suratRes, kelengkapanRes]) => {
        setStats(statRes.data ?? statRes);
        const list = suratRes.data ?? suratRes;
        setRecentSurat(
          [...list]
            .sort((a, b) => new Date(b.tanggal_ajuan) - new Date(a.tanggal_ajuan))
            .slice(0, 5)
        );
        setDataLengkap(kelengkapanRes.lengkap ?? kelengkapanRes.data?.lengkap ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Incomplete data banner */}
      {!dataLengkap && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-5"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">
              Data profil Anda belum lengkap. Lengkapi data untuk dapat mengajukan surat.
            </span>
          </div>
          <Link
            to="/warga/profil"
            className="text-sm font-semibold text-yellow-900 underline underline-offset-2 hover:text-yellow-700 whitespace-nowrap"
          >
            Lengkapi Sekarang →
          </Link>
        </div>
      )}

      <PageHeader
        title={`Selamat datang, ${user?.nama ?? 'Warga'} 👋`}
        subtitle={today}
      />

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon="📄" label="Total Pengajuan" value={stats?.total ?? 0} colorClass="text-blue-700" />
          <StatCard icon="🕐" label="Menunggu" value={stats?.menunggu ?? 0} colorClass="text-yellow-600" />
          <StatCard icon="✅" label="Disetujui" value={stats?.disetujui ?? 0} colorClass="text-green-600" />
          <StatCard icon="❌" label="Ditolak" value={stats?.ditolak ?? 0} colorClass="text-red-600" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link
          to="/warga/buat-surat"
          className="bg-[#1A4A8A] hover:bg-[#0F2D5C] text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <span className="text-2xl">✏️</span>
          <div>
            <p className="font-semibold text-sm">Buat Surat</p>
            <p className="text-xs text-white/70">Dari template atau manual</p>
          </div>
        </Link>
        <Link
          to="/warga/ajukan-ttd"
          className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <span className="text-2xl">✍️</span>
          <div>
            <p className="font-semibold text-sm">Ajukan TTD</p>
            <p className="text-xs text-white/70">Kirim surat ke RT/RW</p>
          </div>
        </Link>
        <Link
          to="/warga/status"
          className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold text-sm text-gray-800">Status Surat</p>
            <p className="text-xs text-gray-500">Lacak pengajuan Anda</p>
          </div>
        </Link>
      </div>

      {/* Recent letters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Pengajuan Terakhir</h2>
          <Link to="/warga/status" className="text-sm text-blue-600 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : recentSurat.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm">Belum ada surat yang diajukan.</p>
            <Link
              to="/warga/buat-surat"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Buat surat pertama Anda →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSurat.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{s.subjek}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(s.tanggal_ajuan)}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

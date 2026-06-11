import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Pencil, FileSignature, ClipboardList, Mailbox } from 'lucide-react';
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
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-warning/10 border border-warning/20 text-warning p-4 rounded-lg mb-5"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Data profil Anda belum lengkap. Lengkapi data untuk dapat mengajukan surat.
            </span>
          </div>
          <Link
            to="/warga/profil"
            className="text-sm font-semibold text-warning underline underline-offset-2 hover:text-yellow-700 whitespace-nowrap"
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
            <div key={i} className="bg-white border border-neutral-100 rounded-lg p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FileText />} label="Total Pengajuan" value={stats?.total ?? 0} colorClass="text-primary" />
          <StatCard icon={<Clock />} label="Menunggu" value={stats?.menunggu ?? 0} colorClass="text-warning" />
          <StatCard icon={<CheckCircle />} label="Disetujui" value={stats?.disetujui ?? 0} colorClass="text-success" />
          <StatCard icon={<XCircle />} label="Ditolak" value={stats?.ditolak ?? 0} colorClass="text-error" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link
          to="/warga/buat-surat"
          className="bg-primary hover:bg-primary-dark text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <Pencil className="w-8 h-8 mb-2" />
          <div>
            <p className="font-semibold text-sm">Buat Surat</p>
            <p className="text-xs text-white/70">Dari template atau manual</p>
          </div>
        </Link>
        <Link
          to="/warga/ajukan-ttd"
          className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <FileSignature className="w-8 h-8 mb-2" />
          <div>
            <p className="font-semibold text-sm">Ajukan TTD</p>
            <p className="text-xs text-white/70">Kirim surat ke RT/RW</p>
          </div>
        </Link>
        <Link
          to="/warga/status"
          className="bg-white border border-neutral-100 hover:border-primary/30 hover:bg-primary-light/10 rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <ClipboardList className="w-8 h-8 mb-2" />
          <div>
            <p className="font-semibold text-sm text-gray-800">Status Surat</p>
            <p className="text-xs text-gray-500">Lacak pengajuan Anda</p>
          </div>
        </Link>
      </div>

      {/* Recent letters */}
      <div className="bg-white border border-neutral-100 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-gray-800">Pengajuan Terakhir</h2>
          <Link to="/warga/status" className="text-sm text-primary-light hover:underline">
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-neutral-50 rounded w-24" />
              </div>
            ))}
          </div>
        ) : recentSurat.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Mailbox className="w-10 h-10 mb-2 mx-auto text-gray-400" />
            <p className="text-sm">Belum ada surat yang diajukan.</p>
            <Link
              to="/warga/buat-surat"
              className="mt-3 inline-block text-sm text-primary-light hover:underline"
            >
              Buat surat pertama Anda →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSurat.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-neutral-900 line-clamp-1">{s.subjek}</p>
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

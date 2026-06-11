import { useEffect, useState } from 'react';
import { Clock, FileText } from 'lucide-react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function RTRWDashboard() {
  const [surat, setSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSurat = () => {
    setLoading(true);
    suratService.getMenungguTTD()
      .then(res => setSurat(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSurat();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const fd = new FormData();
      await suratService.tandaTangani(id, fd);
      fetchSurat();
    } catch (err) {
      alert(err?.message || 'Gagal menyetujui surat');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (!alasan) return;
    setActionLoading(id);
    try {
      await suratService.tolakSurat(id, alasan);
      fetchSurat();
    } catch (err) {
      alert(err?.message || 'Gagal menolak surat');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Dashboard RT/RW" 
        subtitle="Kelola permintaan surat dari warga yang menunggu tanda tangan Anda." 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={<Clock />} label="Menunggu Persetujuan" value={loading ? '...' : surat.length} colorClass="text-warning" />
      </div>

      <div className="bg-white border border-neutral-100 rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h2 className="text-base font-semibold text-gray-800">Antrean Surat Masuk</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 h-16 bg-neutral-50 rounded" />
            ))}
          </div>
        ) : surat.length === 0 ? (
          <EmptyState 
            icon={<FileText className="w-12 h-12 text-gray-300" />} 
            title="Tidak Ada Surat" 
            description="Belum ada surat yang menunggu persetujuan Anda saat ini." 
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {surat.map(s => (
              <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary-light/10 transition-colors">
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">{s.nama_warga || s.warga?.nama}</p>
                  <p className="text-xs text-gray-500 mb-1">NIK: {s.nik_warga || s.warga?.NIK}</p>
                  <p className="text-sm text-gray-800 font-medium">{s.jenis_surat || s.subjek}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Diajukan: {fmt(s.tanggal_ajuan || s.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(s.id)}
                    disabled={actionLoading === s.id}
                    className="px-4 py-2 bg-success hover:bg-success/90 text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                  >
                    {actionLoading === s.id ? 'Memproses...' : 'Setujui & TTD'}
                  </button>
                  <button
                    onClick={() => handleReject(s.id)}
                    disabled={actionLoading === s.id}
                    className="px-4 py-2 bg-error hover:bg-error text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                  >
                    Tolak
                  </button>
                  {s.file_path && (
                    <a href={s.file_path} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded shadow-sm hover:bg-neutral-50">
                      Lihat Dokumen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

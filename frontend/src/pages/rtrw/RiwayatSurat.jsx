import { useEffect, useState } from 'react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function RiwayatSurat() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    suratService.getRiwayatRTRW()
      .then(res => {
        const list = res.data ?? res;
        setHistory([...list].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader 
        title="Riwayat Surat" 
        subtitle="Daftar seluruh surat pengantar yang telah selesai diproses (Disetujui / Ditolak)." 
      />

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse flex h-12 bg-gray-100 rounded" />)}
          </div>
        ) : history.length === 0 ? (
          <EmptyState icon="📂" title="Tidak ada riwayat" description="Belum ada riwayat surat yang diproses." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Warga</th>
                  <th className="px-5 py-3">Jenis Surat</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">{fmt(h.created_at || h.tanggal_ajuan)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{h.nama_warga || h.warga?.nama}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{h.jenis_surat || h.subjek}</td>
                    <td className="px-5 py-4 text-sm"><StatusBadge status={h.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

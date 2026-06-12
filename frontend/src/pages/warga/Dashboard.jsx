import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WargaDashboard() {
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

  const pending  = suratList.filter(s => s.status === 'submitted' || s.status === 'in_review_rt' || s.status === 'in_review_rw').length;
  const approved = suratList.filter(s => s.status === 'completed').length;
  const rejected = suratList.filter(s => s.status === 'rejected').length;
  const recentSurat = suratList.slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-gray-100 text-gray-700">Draft</span>;
      case 'submitted':
      case 'in_review_rt':
      case 'in_review_rw': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-blue-50 text-blue-700">Diproses</span>;
      case 'completed': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700">Selesai</span>;
      case 'rejected': return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-rose-50 text-rose-700">Ditolak</span>;
      default: return <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5282] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Butuh Surat Pengantar RT/RW?</h3>
          <p className="text-blue-200 text-sm max-w-xl">
            Ajukan surat pengantar resmi secara digital. Proses verifikasi langsung dipantau oleh ketua RT &amp; RW (Sistem V2).
          </p>
        </div>
        <Link
          to="/warga/buat-surat-v2"
          className="bg-white text-[#1e3a5f] px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition shadow text-sm self-start md:self-auto whitespace-nowrap"
        >
          + Ajukan Surat Baru
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Sedang Diproses', value: pending,  icon: Clock,        bg: 'bg-blue-50',   color: 'text-blue-600' },
          { label: 'Selesai / Disetujui',  value: approved, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Pengajuan Ditolak',    value: rejected, icon: XCircle,      bg: 'bg-rose-50',    color: 'text-rose-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 ${bg} ${color} rounded-xl`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <p className="text-2xl font-bold text-slate-800">{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Letters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-slate-800 text-sm">Status Pengajuan Terakhir</h4>
          <Link to="/warga/riwayat" className="text-xs text-blue-600 font-bold hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Memuat data surat...</span>
            </div>
          ) : recentSurat.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Belum ada pengajuan surat.{' '}
              <Link to="/warga/buat-surat-v2" className="text-blue-600 font-semibold hover:underline">
                Ajukan sekarang
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Jenis Surat</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSurat.map((s) => (
                  <tr key={s.uuid} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-800">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-4">{s.letter_type_name || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(s.status)}
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
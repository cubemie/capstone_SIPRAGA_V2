import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';
import { STATUS_LABEL, STATUS_COLOR, SURAT_STATUS } from '../../constants/suratStatus';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WargaDashboard() {
  const { data: suratList, loading } = useSurat('my');

  const pending  = suratList.filter(s => s.status === SURAT_STATUS.MENUNGGU).length;
  const approved = suratList.filter(s => s.status === SURAT_STATUS.DISETUJUI).length;
  const rejected = suratList.filter(s => s.status === SURAT_STATUS.DITOLAK).length;
  const recentSurat = suratList.slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5282] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Butuh Surat Pengantar RT/RW?</h3>
          <p className="text-blue-200 text-sm max-w-xl">
            Ajukan surat pengantar resmi secara digital. Proses verifikasi langsung dipantau oleh ketua RT &amp; RW.
          </p>
        </div>
        <Link
          to="/warga/ajukan"
          className="bg-white text-[#1e3a5f] px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition shadow text-sm self-start md:self-auto whitespace-nowrap"
        >
          + Ajukan Surat Baru
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Menunggu Persetujuan', value: pending,  icon: Clock,        bg: 'bg-amber-50',   color: 'text-amber-600' },
          { label: 'Disetujui & Selesai',  value: approved, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
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
          <Link to="/warga/status" className="text-xs text-blue-600 font-bold hover:underline">
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
              <Link to="/warga/ajukan" className="text-blue-600 font-semibold hover:underline">
                Ajukan sekarang
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Keperluan</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSurat.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-800">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-4">{s.subjek || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${STATUS_COLOR[s.status] || 'bg-slate-100 text-slate-700'}`}>
                        {STATUS_LABEL[s.status] || `Status ${s.status}`}
                      </span>
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
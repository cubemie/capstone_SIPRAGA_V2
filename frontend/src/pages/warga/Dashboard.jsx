import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, User, Bell, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSurat } from '../../hooks/useSurat';

/** Hitung jumlah surat per status dari array data */
function countByStatus(suratList, statusMatch) {
  return suratList.filter((s) => statusMatch.includes(s.status)).length;
}

/** Format tanggal ISO ke format "DD Mon YYYY" */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Label + warna badge status */
const STATUS_MAP = {
  pending_rt: { text: 'Menunggu RT', color: 'bg-amber-100 text-amber-800' },
  pending_rw: { text: 'Menunggu RW', color: 'bg-indigo-100 text-indigo-800' },
  approved:   { text: 'Disetujui RW', color: 'bg-emerald-100 text-emerald-800' },
  rejected:   { text: 'Ditolak', color: 'bg-rose-100 text-rose-800' },
};

export default function WargaDashboard() {
  const { data: suratList, loading } = useSurat('my');

  // Stats dihitung dari data real
  const pending = countByStatus(suratList, ['pending_rt', 'pending_rw']);
  const approved = countByStatus(suratList, ['approved']);
  const rejected = countByStatus(suratList, ['rejected']);

  // 3 surat terakhir
  const recentSurat = suratList.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Butuh Surat Pengantar RT/RW?</h3>
          <p className="text-slate-200 text-sm max-w-xl">
            Ajukan surat pengantar resmi secara digital sekarang. Proses verifikasi langsung dipantau oleh ketua RT &amp; RW setempat.
          </p>
        </div>
        <Link to="/warga/ajukan" className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition shadow self-start md:self-auto">
          + Ajukan Surat Baru
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm text-slate-500 font-medium">Menunggu Persetujuan</span>
            <p className="text-2xl font-bold text-slate-800">{loading ? '—' : pending}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm text-slate-500 font-medium">Disetujui &amp; Selesai</span>
            <p className="text-2xl font-bold text-slate-800">{loading ? '—' : approved}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm text-slate-500 font-medium">Pengajuan Ditolak</span>
            <p className="text-2xl font-bold text-slate-800">{loading ? '—' : rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent Letters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-slate-800">Status Pengajuan Terakhir</h4>
          <Link to="/warga/status" className="text-xs text-blue-600 font-bold hover:underline">
            Lihat Semua
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
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-150">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Jenis Surat</th>
                  <th className="px-6 py-3">Keperluan</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSurat.map((s) => {
                  const statusInfo = STATUS_MAP[s.status] || { text: s.status, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/55 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {formatDate(s.created_at || s.tanggal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{s.jenis_surat || s.subjek}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{s.keperluan || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${statusInfo.color} text-xs px-2.5 py-1 rounded-full font-bold`}>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

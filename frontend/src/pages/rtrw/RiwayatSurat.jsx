import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, AlertCircle } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';

/** Format tanggal ISO ke format "DD Mon YYYY" */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const STATUS_MAP = {
  approved:    { text: 'Disetujui RW (Selesai)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  approved_rw: { text: 'Disetujui RW (Selesai)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected:    { text: 'Ditolak RT', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  rejected_rt: { text: 'Ditolak RT', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export default function RiwayatSurat() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: history, loading, error } = useSurat('riwayat');

  const filteredHistory = history.filter(
    (item) =>
      (item.nama_warga || item.warga?.nama || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.jenis_surat || item.subjek || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link to="/rtrw/dashboard" className="text-slate-400 hover:text-slate-900 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Pengarsipan Surat</h1>
      </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Arsip Surat Pengantar</h2>
            <p className="text-slate-500 text-xs">Menyimpan data seluruh surat pengantar warga yang telah diproses.</p>
          </div>

          {/* Search Box */}
          <div className="relative rounded-xl shadow-sm max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari warga atau nama surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat riwayat surat...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* History Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-150">
                  <tr>
                    <th className="px-6 py-4">Tanggal Proses</th>
                    <th className="px-6 py-4">Nama Warga</th>
                    <th className="px-6 py-4">Jenis Surat / Pengantar</th>
                    <th className="px-6 py-4">Status Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => {
                    const statusInfo = STATUS_MAP[item.status] || { text: item.status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          {formatDate(item.created_at || item.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                          {item.nama_warga || item.warga?.nama || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.jenis_surat || item.subjek}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        {history.length === 0
                          ? 'Belum ada riwayat surat.'
                          : 'Tidak ada riwayat yang cocok dengan pencarian Anda.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

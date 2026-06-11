import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, AlertCircle } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';
import { STATUS_LABEL, STATUS_COLOR } from '../../constants/suratStatus';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function RiwayatSurat() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: history, loading, error } = useSurat('riwayat');

  const filteredHistory = history.filter((item) => {
    const haystack = `${item.nama_warga || ''} ${item.jenis_surat || item.subjek || ''}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/rtrw/dashboard" className="text-slate-400 hover:text-slate-900 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Pengarsipan Surat</h1>
          <p className="text-slate-400 text-xs">Surat yang telah disetujui atau ditolak.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama warga atau jenis surat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Memuat riwayat...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {searchTerm ? 'Tidak ada hasil yang cocok.' : 'Belum ada riwayat surat.'}
            </div>
          ) : (
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-left">Nama Warga</th>
                  <th className="px-5 py-3 text-left">Jenis Surat</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{item.nama_warga}</td>
                    <td className="px-5 py-4">{item.jenis_surat || item.subjek}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${STATUS_COLOR[item.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {STATUS_LABEL[item.status] || `Status ${item.status}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
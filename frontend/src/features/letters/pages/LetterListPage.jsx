import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Search, Eye, Filter } from 'lucide-react';
import { api } from '../../../utils/api';

// Fungsi format tanggal
const formatDate = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTime = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// Fungsi bantuan untuk badge status
const getStatusBadge = (status) => {
  switch (status) {
    case 'draft':
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">Draft</span>;
    case 'submitted':
    case 'in_review_rt':
    case 'in_review_rw':
      return (
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Diproses
        </span>
      );
    case 'completed':
      return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Selesai
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Ditolak
        </span>
      );
    default:
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
  }
};

export default function LetterListPage() {
  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['my-v2-letters'],
    queryFn: async () => {
      const res = await api.get('/v2/letters');
      if (res.error) throw new Error(res.error);
      return res.data?.data || [];
    },
    staleTime: 60 * 1000, // 1 menit cache agar tidak loading terus saat pindah tab
    retry: false // Jangan retry otomatis (yang bikin loading lama) jika error/404
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Status & Riwayat Surat</h1>
          <p className="text-slate-500 mt-1">Pantau status pengajuan dan riwayat surat Anda (Sistem Baru).</p>
        </div>
        <Link 
          to="/warga/buat-surat-v2"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Ajukan Surat Baru
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar / Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari surat..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium w-full sm:w-auto justify-center transition">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-semibold">TANGGAL</th>
                <th className="px-6 py-4 font-semibold">JENIS SURAT</th>
                <th className="px-6 py-4 font-semibold">KEPERLUAN</th>
                <th className="px-6 py-4 font-semibold text-center">STATUS</th>
                <th className="px-6 py-4 font-semibold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data surat...
                    </div>
                  </td>
                </tr>
              ) : letters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-700">Belum ada surat</p>
                      <p className="text-sm">Anda belum mengajukan surat apapun melalui sistem ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                letters.map((letter) => (
                  <tr key={letter.uuid} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 align-middle">
                      <div className="text-sm font-medium text-slate-900">
                        {formatDate(letter.created_at)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatTime(letter.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="text-sm font-semibold text-slate-800">
                        {letter.letter_type_name || 'Surat Keterangan'}
                      </div>
                      {letter.letter_number && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {letter.letter_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {letter.purpose || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(letter.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <Link 
                        to={`/warga/surat/${letter.uuid}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

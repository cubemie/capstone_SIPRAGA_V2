import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Download, Loader2, AlertCircle } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';

/** Format tanggal ISO ke format "DD Mon YYYY" */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const STATUS_MAP = {
  pending_rt: { text: 'Menunggu Verifikasi RT', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  pending_rw: { text: 'Menunggu Verifikasi RW', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  approved:   { text: 'Disetujui RW (Selesai)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected:   { text: 'Ditolak', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export default function StatusSurat() {
  const { data: letters, loading, error } = useSurat('my');

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link to="/warga/dashboard" className="text-slate-400 hover:text-blue-600 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Status Pengajuan Surat Anda</h1>
      </div>
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Pengajuan</h2>
            <p className="text-slate-500 text-xs">Lacak progres persetujuan surat pengantar RT dan RW Anda di sini.</p>
          </div>
          <Link to="/warga/ajukan" className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow">
            + Buat Pengajuan Baru
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat data pengajuan...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && letters.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
            <p className="text-slate-400 text-sm mb-3">Belum ada pengajuan surat.</p>
            <Link to="/warga/ajukan" className="text-blue-600 font-semibold text-sm hover:underline">
              Ajukan Surat Sekarang →
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && letters.length > 0 && (
          <div className="space-y-4">
            {letters.map((letter) => {
              const statusInfo = STATUS_MAP[letter.status] || { text: letter.status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
              return (
                <div
                  key={letter.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow transition duration-150"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold text-slate-400">
                        {formatDate(letter.created_at || letter.tanggal)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{letter.jenis_surat || letter.subjek}</h3>
                      <p className="text-slate-500 text-sm mt-1">Keperluan: {letter.keperluan || '-'}</p>
                    </div>
                    {letter.alasan_penolakan && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
                        <span className="font-bold block mb-1">Alasan Penolakan:</span>
                        {letter.alasan_penolakan}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                    {letter.status === 'approved' ? (
                      <a
                        href={letter.download_url || '#'}
                        className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                      >
                        <Download className="w-4 h-4" />
                        Unduh Surat (Signed)
                      </a>
                    ) : letter.status === 'rejected' ? (
                      <Link
                        to="/warga/ajukan"
                        className="w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                      >
                        Ajukan Ulang
                      </Link>
                    ) : (
                      <button className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Sedang Diproses
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

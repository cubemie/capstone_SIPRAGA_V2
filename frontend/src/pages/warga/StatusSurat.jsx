import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Download, Loader2, AlertCircle } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';
import { STATUS_LABEL, STATUS_COLOR, SURAT_STATUS } from '../../constants/suratStatus';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function StatusSurat() {
  const { data: letters, loading, error } = useSurat('my');

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/warga/dashboard" className="text-slate-400 hover:text-blue-600 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Status Pengajuan Surat</h1>
          <p className="text-slate-400 text-xs">Lacak progres persetujuan surat pengantar Anda.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/warga/ajukan" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2d5282] transition shadow">
          + Buat Pengajuan Baru
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Memuat data pengajuan...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && letters.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
          <p className="text-slate-400 text-sm mb-3">Belum ada pengajuan surat.</p>
          <Link to="/warga/ajukan" className="text-blue-600 font-semibold text-sm hover:underline">
            Ajukan Surat Sekarang →
          </Link>
        </div>
      )}

      {!loading && !error && letters.length > 0 && (
        <div className="space-y-4">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md transition duration-150"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">{formatDate(letter.created_at)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLOR[letter.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {STATUS_LABEL[letter.status] || `Status ${letter.status}`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{letter.subjek || '—'}</h3>
                {letter.alasan_penolakan && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
                    <span className="font-bold block mb-1">Alasan Penolakan:</span>
                    {letter.alasan_penolakan}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                {letter.status === SURAT_STATUS.DISETUJUI && letter.file_path_signed ? (
                  <a
                    href={letter.file_path_signed}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Surat
                  </a>
                ) : letter.status === SURAT_STATUS.DITOLAK ? (
                  <Link
                    to="/warga/ajukan"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Ajukan Ulang
                  </Link>
                ) : (
                  <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Sedang Diproses
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
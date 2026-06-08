import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckSquare, History, Award, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSurat } from '../../hooks/useSurat';
import { suratService } from '../../services/suratService';

export default function RtRwDashboard() {
  const { data: suratMasuk, loading, error, refetch } = useSurat('masuk');

  const [actionLoading, setActionLoading] = useState(null); // ID surat yang sedang diproses

  const handleApprove = async (id) => {
    setActionLoading(id);
    const { error: err } = await suratService.approveSurat(id);
    setActionLoading(null);
    if (!err) refetch();
  };

  const handleReject = async (id) => {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (!alasan) return;
    setActionLoading(id);
    const { error: err } = await suratService.rejectSurat(id, alasan);
    setActionLoading(null);
    if (!err) refetch();
  };

  // Stats
  const pendingCount = suratMasuk.filter(s => s.status === 'pending_rt' || s.status === 'pending_rw').length;

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Butuh Verifikasi</span>
            <p className="text-xl font-bold text-slate-800">{loading ? '—' : pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Masuk</span>
            <p className="text-xl font-bold text-slate-800">{loading ? '—' : suratMasuk.length}</p>
          </div>
        </div>
      </div>

      {/* Verification Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-slate-800">Daftar Surat Masuk (Butuh Persetujuan)</h4>
          {!loading && pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
              Ada {pendingCount} surat pending
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat surat masuk...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="m-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && suratMasuk.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada surat yang membutuhkan verifikasi saat ini.
          </div>
        )}

        {/* List */}
        {!loading && !error && suratMasuk.length > 0 && (
          <div className="divide-y divide-slate-100">
            {suratMasuk.map((surat) => (
              <div
                key={surat.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{surat.nama_warga || surat.warga?.nama}</span>
                    <span className="text-xs text-slate-400">• NIK: {surat.nik_warga || surat.warga?.nik}</span>
                  </div>
                  <p className="text-slate-800 font-medium text-sm">
                    {surat.jenis_surat || surat.subjek}
                    {surat.keperluan && ` (${surat.keperluan})`}
                  </p>
                  <span className="text-xs text-slate-400 block">
                    Diajukan pada: {new Date(surat.created_at || surat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(surat.id)}
                    disabled={actionLoading === surat.id}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-60"
                  >
                    {actionLoading === surat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Setujui'}
                  </button>
                  <button
                    onClick={() => handleReject(surat.id)}
                    disabled={actionLoading === surat.id}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
                  >
                    Tolak
                  </button>
                  {surat.dokumen_url && (
                    <a
                      href={surat.dokumen_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
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

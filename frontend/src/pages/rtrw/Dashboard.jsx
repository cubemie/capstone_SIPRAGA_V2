import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { useSurat } from '../../hooks/useSurat';
import { suratService } from '../../services/suratService';
import { toast } from 'sonner';
import { SURAT_STATUS } from '../../constants/suratStatus';

/** Modal konfirmasi tolak surat */
function RejectModal({ suratId, onClose, onSuccess }) {
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!alasan.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }
    setLoading(true);
    const { error: err } = await suratService.rejectSurat(suratId, alasan);
    setLoading(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success('Surat berhasil ditolak.');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Tolak Surat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500">Masukkan alasan penolakan agar warga dapat mengajukan ulang dengan benar.</p>
        <textarea
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          rows={3}
          placeholder="Contoh: Dokumen pendukung tidak sesuai, harap sertakan fotokopi KTP terbaru."
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Konfirmasi Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RtRwDashboard() {
  const { data: suratMasuk, loading, error, refetch } = useSurat('masuk');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);

  const handleApprove = async (id) => {
    setActionLoading(id);
    const formData = new FormData();
    const { error: err } = await suratService.approveSurat(id, formData);
    setActionLoading(null);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success('Surat berhasil disetujui.');
    refetch();
  };

  const pendingCount = suratMasuk.filter(s => s.status === SURAT_STATUS.MENUNGGU).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {rejectModalId && (
        <RejectModal
          suratId={rejectModalId}
          onClose={() => setRejectModalId(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Butuh Verifikasi</span>
            <p className="text-xl font-bold text-slate-800">{loading ? '—' : pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Masuk</span>
            <p className="text-xl font-bold text-slate-800">{loading ? '—' : suratMasuk.length}</p>
          </div>
        </div>
      </div>

      {/* Surat List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-slate-800 text-sm">Surat Masuk (Butuh Persetujuan)</h4>
          {!loading && pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
              {pendingCount} surat pending
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat surat masuk...</span>
          </div>
        )}

        {!loading && error && (
          <div className="m-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && suratMasuk.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada surat yang membutuhkan verifikasi saat ini.
          </div>
        )}

        {!loading && !error && suratMasuk.length > 0 && (
          <div className="divide-y divide-slate-100">
            {suratMasuk.map((surat) => (
              <div key={surat.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{surat.nama_warga}</span>
                    <span className="text-xs text-slate-400">NIK: {surat.nik_warga}</span>
                  </div>
                  <p className="text-slate-700 font-medium text-sm">{surat.subjek}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {surat.file_path && (
                    <a href={surat.file_path} target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
                      <FileText className="w-3.5 h-3.5 inline mr-1" />
                      Lihat
                    </a>
                  )}
                  <button
                    onClick={() => handleApprove(surat.id)}
                    disabled={actionLoading === surat.id}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-60"
                  >
                    {actionLoading === surat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Setujui'}
                  </button>
                  <button
                    onClick={() => setRejectModalId(surat.id)}
                    disabled={actionLoading === surat.id}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { suratService } from '../../services/suratService';

export default function RtRwAjukanSurat() {
  const navigate = useNavigate();
  const [wargaNik, setWargaNik] = useState('');
  const [wargaNama, setWargaNama] = useState('');
  const [jenisSurat, setJenisSurat] = useState('');
  const [alasan, setAlasan] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await suratService.ajukanSuratOffline({
      nik_warga: wargaNik,
      nama_warga: wargaNama,
      jenis_surat: jenisSurat,
      alasan,
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSubmitted(true);
    setTimeout(() => navigate('/rtrw/dashboard'), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/rtrw/dashboard" className="text-slate-400 hover:text-slate-900 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Buat Surat Pengantar Offline</h1>
      </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Surat Pengantar Berhasil Dibuat!</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm">
                Surat Pengantar Offline berhasil digenerate dan didaftarkan pada sistem. Dialihkan kembali ke Dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Formulir Pembuatan Surat Pengantar (Manual/Offline)</h3>
                <p className="text-slate-500 text-sm">
                  Gunakan form ini jika ada warga yang meminta surat secara langsung (offline) agar data surat tetap terdigitalisasi.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIK Warga */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">NIK Warga Pemohon</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={wargaNik}
                    onChange={(e) => setWargaNik(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="320xxxxxxxxxxxxx"
                  />
                </div>

                {/* Nama Warga */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Nama Lengkap Warga Pemohon</label>
                  <input
                    type="text"
                    required
                    value={wargaNama}
                    onChange={(e) => setWargaNama(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="Sesuai KTP Warga"
                  />
                </div>
              </div>

              {/* Jenis Surat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Jenis Surat Pengantar</label>
                <select
                  value={jenisSurat}
                  onChange={(e) => setJenisSurat(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                >
                  <option value="">-- Pilih Jenis Surat --</option>
                  <option value="surat_domisili">Surat Pengantar Domisili</option>
                  <option value="surat_usaha">Surat Keterangan Usaha (SKU)</option>
                  <option value="surat_tidak_mampu">Surat Keterangan Tidak Mampu (SKTM)</option>
                  <option value="surat_kematian">Surat Keterangan Kematian</option>
                </select>
              </div>

              {/* Alasan / Keperluan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Alasan / Keperluan Keterangan</label>
                <textarea
                  required
                  rows={4}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Contoh: Digunakan untuk persyaratan administrasi pendaftaran sekolah anak..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link to="/rtrw/dashboard" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition text-sm">
                  Batalkan
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition text-sm flex items-center shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Terbitkan &amp; Simpan Surat</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
    </div>
  );
}

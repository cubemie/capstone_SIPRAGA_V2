import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { suratService, templateService, wargaService } from '../../services';

export default function AjukanSurat() {
  const [subjek, setSubjek] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profil warga untuk auto-fill alamat
  const [profil, setProfil] = useState(null);

  // Fetch daftar template dari backend
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [templateRes, profilRes] = await Promise.all([
        templateService.getAll(),
        wargaService.getProfil(),
      ]);

      setLoadingTemplates(false);

      if (!templateRes.error && templateRes.data) {
        const list = Array.isArray(templateRes.data) ? templateRes.data : templateRes.data?.data ?? [];
        setTemplates(list);
      }

      if (!profilRes.error && profilRes.data) {
        const p = profilRes.data?.data ?? profilRes.data;
        setProfil(p);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Mohon unggah dokumen pendukung (PDF/DOCX).');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('subjek', subjek);
    formData.append('template_id', templateId);
    // Field file HARUS 'fileSurat' sesuai backend: uploadSurat.single('fileSurat')
    formData.append('fileSurat', file);
    // Data alamat diambil dari profil warga yang sudah login
    if (profil) {
      formData.append('provinsi', profil.provinsi || '');
      formData.append('kota', profil.kota || '');
      formData.append('kecamatan', profil.kecamatan || '');
      formData.append('kelurahan', profil.kelurahan_desa || '');
      formData.append('rt', profil.rt || '');
      formData.append('rw', profil.rw || '');
    }

    const { error: err } = await suratService.ajukanSurat(formData);

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSubmitted(true);
    setTimeout(() => navigate('/warga/status'), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/warga/dashboard" className="text-slate-400 hover:text-primary-light transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Ajukan Surat Baru</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pengajuan Surat Berhasil Dikirim!</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm">
                Surat pengajuan Anda telah berhasil diteruskan ke Ketua RT untuk proses verifikasi awal. Dialihkan ke halaman status surat...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Formulir Pengajuan Surat Pengantar</h3>
                <p className="text-slate-500 text-sm">
                  Harap mengisi data di bawah ini dengan benar untuk pengajuan surat resmi ke RT &amp; RW.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Subjek / Keperluan Pengajuan</label>
                <input
                  type="text"
                  required
                  value={subjek}
                  onChange={(e) => setSubjek(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Contoh: Pengurusan KTP Baru, Surat Keterangan Usaha (SKU)"
                />
              </div>

              {/* Template Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Pilih Template Surat</label>
                {loadingTemplates ? (
                  <div className="mt-1 flex items-center gap-2 text-slate-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat template...</span>
                  </div>
                ) : (
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    {templates.length === 0 ? (
                      <option value="">— Belum ada template tersedia —</option>
                    ) : (
                      templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.nama_template || t.nama}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Unggah Dokumen Pendukung (PDF/JPG)</label>
                <div className="mt-1 border-2 border-dashed border-slate-300 rounded-xl px-6 py-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex justify-center text-sm text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-primary-light hover:text-blue-500">
                        <span>Pilih file dokumen</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, PDF hingga 5MB</p>
                  </div>
                  {file && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-sm">
                      <FileText className="w-5 h-5" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link to="/warga/dashboard" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition text-sm">
                  Batalkan
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-primary-dark text-white font-semibold rounded-xl hover:bg-primary-dark transition text-sm flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Kirim Pengajuan</>
                  )}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';

export default function AjukanSurat() {
  const [subjek, setSubjek] = useState('');
  const [template, setTemplate] = useState('surat_pengantar');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/warga/status');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/warga/dashboard" className="text-white hover:text-slate-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">📮 Ajukan Surat Baru</h1>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
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
                  Harap mengisi data di bawah ini dengan benar untuk pengajuan surat resmi ke RT & RW.
                </p>
              </div>

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
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                >
                  <option value="surat_pengantar">Surat Keterangan Pengantar RT/RW</option>
                  <option value="sku">Surat Keterangan Usaha (SKU)</option>
                  <option value="sktm">Surat Keterangan Tidak Mampu (SKTM)</option>
                  <option value="surat_kematian">Surat Keterangan Kematian</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Unggah Dokumen Pendukung (PDF/JPG)</label>
                <div className="mt-1 border-2 border-dashed border-slate-300 rounded-xl px-6 py-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex justify-center text-sm text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-blue-600 hover:text-blue-500">
                        <span>Pilih file dokumen</span>
                        <input
                          type="file"
                          className="sr-only"
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
                <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition text-sm flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

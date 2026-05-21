import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Check, Upload, Trash2, Edit2 } from 'lucide-react';

export default function TtdSurat() {
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSignatureUrl(url);
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  const handleDelete = () => {
    setSignatureUrl(null);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/rtrw/dashboard" className="text-white hover:text-slate-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">📮 Pengaturan Tanda Tangan Digital</h1>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tanda Tangan Digital (E-Signature)</h3>
            <p className="text-slate-500 text-sm">
              Unggah file tanda tangan transparan (format PNG) Anda untuk ditempelkan secara otomatis pada surat pengantar yang Anda setujui.
            </p>
          </div>

          {/* Alert State */}
          {isSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Tanda tangan digital berhasil diperbarui dan aktif!</span>
            </div>
          )}

          {/* Upload / Signature display box */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 min-h-[300px] relative overflow-hidden">
            {signatureUrl ? (
              <div className="text-center space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview Tanda Tangan Anda</p>
                <div className="bg-white p-6 border border-slate-200 rounded-xl max-w-sm mx-auto shadow-sm flex items-center justify-center">
                  <img src={signatureUrl} alt="Digital Signature" className="max-h-40 object-contain" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleDelete}
                    className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition text-sm flex items-center shadow"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Upload className="w-16 h-16 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Belum ada tanda tangan yang diunggah</p>
                  <p className="text-slate-400 text-xs max-w-xs">Gunakan file gambar berlatar transparan (PNG) untuk hasil optimal.</p>
                </div>
                <label className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition cursor-pointer shadow">
                  <span>Pilih File Gambar</span>
                  <input type="file" accept="image/png" className="sr-only" onChange={handleUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

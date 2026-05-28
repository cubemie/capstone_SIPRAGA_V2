import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Download, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useTemplate } from '../../hooks/useTemplate';
import { templateService } from '../../services/templateService';

export default function TemplateSurat() {
  const { data: templates, loading, error, refetch } = useTemplate();

  const [newTemplateName, setNewTemplateName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTemplateName || !uploadedFile) return;

    setUploadError('');
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('nama_template', newTemplateName);
    formData.append('file', uploadedFile);

    const { error: err } = await templateService.upload(formData);

    setUploadLoading(false);

    if (err) {
      setUploadError(err);
      return;
    }

    setNewTemplateName('');
    setUploadedFile(null);
    setSubmitted(true);
    refetch(); // refresh daftar template

    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus template ini?')) return;
    setDeletingId(id);
    const { error: err } = await templateService.deleteById(id);
    setDeletingId(null);
    if (!err) refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/superadmin/dashboard" className="text-white hover:text-slate-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">📮 Pengelolaan Template Surat Resmi</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* List of Templates */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Daftar Dokumen Template Aktif</h3>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Memuat template...</span>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && templates.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">Belum ada template yang diunggah.</p>
              )}

              {/* Template List */}
              {!loading && !error && templates.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {templates.map((template) => (
                    <div key={template.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">
                            {template.nama_template || template.nama}
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {template.filename || template.file_name || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={templateService.getDownloadUrl(template.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg hover:bg-blue-50 transition"
                          title="Unduh"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(template.id)}
                          disabled={deletingId === template.id}
                          className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg hover:bg-rose-50 transition disabled:opacity-60"
                          title="Hapus"
                        >
                          {deletingId === template.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Form */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Unggah Template Baru</h3>

              {submitted && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Template baru berhasil ditambahkan!</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nama Template</label>
                  <input
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="Contoh: Surat Pengantar Nikah"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">File Template (DOCX/PDF)</label>
                  <div className="mt-1 border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept=".docx,.pdf"
                      onChange={handleUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-blue-600 block">Klik untuk memilih file</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">DOCX atau PDF maks. 10MB</span>
                    {uploadedFile && (
                      <span className="mt-3 block text-emerald-600 text-xs font-bold">{uploadedFile.name}</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploadLoading ? 'Mengunggah...' : 'Tambah Template Surat'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { suratService, templateService, wargaService } from '../../services';
import FileDropzone from '../../components/ui/FileDropzone';
import PageHeader from '../../components/ui/PageHeader';

const INITIAL_FORM = {
  provinsi: '', kota: '', kecamatan: '', kelurahan: '',
  rt: '', rw: '', keterangan: '',
};

const BuatSurat = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [mode, setMode] = useState(null); // null | 'template' | 'manual'
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      templateService.getAll(),
      wargaService.getProfil(),
    ])
      .then(([tmpl, profRes]) => {
        setTemplates(tmpl.data ?? tmpl);
        const p = profRes.data ?? profRes;
        setForm((prev) => ({
          ...prev,
          provinsi: p.provinsi ?? '',
          kota: p.kota ?? '',
          kecamatan: p.kecamatan ?? '',
          kelurahan: p.kelurahan_desa ?? '',
          rt: p.rt ?? '',
          rw: p.rw ?? '',
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'template' && !file) {
      setError('Harap unggah dokumen pendukung atau surat yang sudah diisi.');
      return;
    }

    const subjek =
      mode === 'template'
        ? selectedTemplate.nama
        : `[MANUAL] ${form.keterangan}`;

    const fd = new FormData();
    fd.append('subjek', subjek);
    fd.append('provinsi', form.provinsi);
    fd.append('kota', form.kota);
    fd.append('kecamatan', form.kecamatan);
    fd.append('kelurahan', form.kelurahan);
    fd.append('rt', form.rt);
    fd.append('rw', form.rw);
    if (file) fd.append('fileSurat', file);

    try {
      setSubmitting(true);
      await suratService.ajukanSurat(fd);
      setSuccess(true);
    } catch (err) {
      setError(err?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">✅</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {mode === 'manual' ? 'Permintaan terkirim!' : 'Surat berhasil diajukan!'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          {mode === 'manual'
            ? 'Admin akan membuatkan surat untuk Anda. Pantau status di halaman Status Surat.'
            : 'Surat Anda telah dikirim dan menunggu proses TTD dari RT/RW.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/warga/status')}
            className="px-4 py-2 bg-[#1A4A8A] text-white rounded text-sm font-medium hover:bg-[#0F2D5C]"
          >
            Lihat Status
          </button>
          <button
            onClick={() => { setSuccess(false); setMode(null); setSelectedTemplate(null); setFile(null); setForm(INITIAL_FORM); }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50"
          >
            Buat Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div>
        <PageHeader title="Buat Surat" subtitle="Pilih template atau ajukan pembuatan surat manual" />

        {loadingTemplates ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Pilih jenis surat yang ingin Anda buat. Anda bisa mengunduh template, mengisinya, lalu unggah kembali.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {templates.map((t) => (
                <button
                  key={t.id_template}
                  onClick={() => { setSelectedTemplate(t); setMode('template'); }}
                  className="bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-5 text-left transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">📄</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm leading-snug">{t.nama}</p>
                      <a
                        href={templateService.getDownloadUrl(t.id_template)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        ↓ Unduh template
                      </a>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-100 px-3 text-gray-400">atau</span>
              </div>
            </div>

            <button
              onClick={() => setMode('manual')}
              className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-5 flex items-center gap-4 transition-all"
            >
              <span className="text-3xl">📝</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Template tidak tersedia?</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ajukan permintaan manual. Admin akan membuatkan surat sesuai kebutuhan Anda.
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-lg">→</span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => { setMode(null); setSelectedTemplate(null); setFile(null); }}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Kembali
        </button>
      </div>

      <PageHeader
        title={mode === 'manual' ? 'Permintaan Surat Manual' : selectedTemplate.nama}
        subtitle={
          mode === 'manual'
            ? 'Deskripsikan surat yang Anda butuhkan. Admin akan memproses dan menghubungi Anda.'
            : 'Isi data di bawah lalu unggah dokumen yang sudah diisi.'
        }
      />

      {mode === 'template' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-5 flex items-start gap-2">
          <span>ℹ️</span>
          <div className="text-sm">
            <p className="font-medium mb-0.5">Cara menggunakan template:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
              <li><a href={templateService.getDownloadUrl(selectedTemplate.id_template)} target="_blank" rel="noopener noreferrer" className="underline">Unduh template</a> di atas</li>
              <li>Isi template sesuai data Anda</li>
              <li>Unggah kembali file yang sudah diisi di bawah</li>
            </ol>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Alamat Tujuan Surat</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'provinsi', label: 'Provinsi' },
              { name: 'kota', label: 'Kota / Kabupaten' },
              { name: 'kecamatan', label: 'Kecamatan' },
              { name: 'kelurahan', label: 'Kelurahan / Desa' },
              { name: 'rt', label: 'Nomor RT', placeholder: 'contoh: 001' },
              { name: 'rw', label: 'Nomor RW', placeholder: 'contoh: 005' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  id={name} name={name} value={form[name]} onChange={handleChange}
                  placeholder={placeholder ?? `Isi ${label.toLowerCase()}`} required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {mode === 'manual' && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Keterangan Surat</h3>
            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-1">
                Jelaskan surat yang dibutuhkan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="keterangan" name="keterangan" rows={4}
                value={form.keterangan} onChange={handleChange} required
                placeholder="Contoh: Saya membutuhkan surat keterangan usaha untuk keperluan pengajuan kredit di bank."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
              />
              <p className="text-xs text-gray-400 mt-1">Semakin detail deskripsi Anda, semakin akurat surat yang dibuat admin.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            {mode === 'manual' ? 'Dokumen Pendukung (opsional)' : 'Unggah Template yang Sudah Diisi'}
          </h3>
          <FileDropzone
            accept=".pdf,.docx" maxMB={5} value={file} onChange={setFile}
            hint={mode === 'manual' ? 'Lampirkan dokumen pendukung jika ada' : 'Unggah template yang sudah Anda isi'}
          />
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => { setMode(null); setSelectedTemplate(null); setFile(null); }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit" disabled={submitting}
            className="px-5 py-2 bg-[#1A4A8A] hover:bg-[#0F2D5C] text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {submitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Mengirim...' : mode === 'manual' ? 'Kirim Permintaan' : 'Ajukan Surat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuatSurat;

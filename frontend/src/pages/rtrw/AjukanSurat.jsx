// frontend/src/pages/rtrw/AjukanSurat.jsx
// POST /api/surat/offline — buat surat untuk warga yang datang langsung

import { useState } from 'react';
import { CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import { Link } from 'react-router-dom';

const JENIS_SURAT = [
  'Surat Pengantar Domisili',
  'Surat Keterangan Usaha',
  'Surat Keterangan Tidak Mampu',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Kematian',
  'Surat Pengantar Nikah',
  'Surat Keterangan Pindah',
  'Surat Keterangan Lainnya',
];

const INITIAL = { nik_warga: '', nama_warga: '', jenis_surat: '', alasan: '' };

export default function AjukanSuratOffline() {
  const [form, setForm]         = useState(INITIAL);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [lastNama, setLastNama] = useState('');

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await suratService.ajukanOffline(fd);
      setLastNama(form.nama_warga);
      setForm(INITIAL);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Gagal mengajukan surat offline. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Surat Berhasil Dibuat!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Surat offline untuk <strong>{lastNama}</strong> telah berhasil diterbitkan dan masuk ke sistem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSuccess(false)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Buat Surat Lainnya
            </button>
            <Link
              to="/rtrw/riwayat"
              className="px-5 py-2.5 border border-neutral-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Buat Surat Offline"
        subtitle="Buat surat pengantar secara manual untuk warga yang datang langsung ke lokasi."
      />

      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-6">
        {error && (
          <div role="alert" className="mb-4 bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Data warga */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Data Warga
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  NIK Warga <span className="text-error">*</span>
                </label>
                <input
                  required
                  name="nik_warga"
                  value={form.nik_warga}
                  onChange={handleChange}
                  maxLength={16}
                  placeholder="16 digit NIK"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Lengkap <span className="text-error">*</span>
                </label>
                <input
                  required
                  name="nama_warga"
                  value={form.nama_warga}
                  onChange={handleChange}
                  placeholder="Nama sesuai KTP"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Jenis surat */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Jenis Surat
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pilih Jenis Surat <span className="text-error">*</span>
              </label>
              <select
                required
                name="jenis_surat"
                value={form.jenis_surat}
                onChange={handleChange}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">— Pilih jenis surat —</option>
                {JENIS_SURAT.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Keperluan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Keperluan / Keterangan
            </label>
            <textarea
              name="alasan"
              value={form.alasan}
              onChange={handleChange}
              rows={3}
              placeholder="Opsional. Jelaskan keperluan atau keterangan tambahan..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-neutral-100">
            <Link
              to="/rtrw/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Memproses...
                </>
              ) : (
                <><FileText className="w-4 h-4" /> Terbitkan Surat</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

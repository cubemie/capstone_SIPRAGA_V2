// frontend/src/pages/rtrw/profil.jsx
// GET /api/auth/check-session  — tampil data profil RT/RW
// POST /api/ttd/upload-ttd     — upload TTD baru
// GET /api/ttd/current-ttd     — ambil TTD aktif

import { useEffect, useState } from 'react';
import { User, CheckCircle, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ttdService } from '../../services';
import FileDropzone from '../../components/ui/FileDropzone';
import PageHeader from '../../components/ui/PageHeader';

const Field = ({ label, value }) => (
  <div>
    <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
    <dd className="text-sm font-medium text-gray-800">{value || '—'}</dd>
  </div>
);

export default function RTRWProfil() {
  const { user } = useAuth();

  // ── TTD state ────────────────────────────────────────
  const [currentTtd, setCurrentTtd]     = useState(null);
  const [ttdLoading, setTtdLoading]     = useState(true);
  const [ttdFile, setTtdFile]           = useState(null);
  const [ttdUploading, setTtdUploading] = useState(false);
  const [ttdMsg, setTtdMsg]             = useState('');
  const [ttdError, setTtdError]         = useState('');

  const fetchTtd = () => {
    setTtdLoading(true);
    ttdService.getCurrentTTD()
      .then(res => {
        const d = res.data ?? res;
        setCurrentTtd(d?.ttd_url ?? d?.data?.ttd_url ?? null);
      })
      .catch(() => {})
      .finally(() => setTtdLoading(false));
  };

  useEffect(() => {
    fetchTtd();
  }, []);

  const handleUploadTtd = async (e) => {
    e.preventDefault();
    if (!ttdFile) return;
    setTtdUploading(true);
    setTtdMsg('');
    setTtdError('');
    try {
      const fd = new FormData();
      fd.append('ttdImage', ttdFile);
      await ttdService.uploadTTD(fd);
      setTtdMsg('Tanda tangan berhasil diperbarui.');
      setTtdFile(null);
      fetchTtd();
    } catch (err) {
      setTtdError(err?.message || 'Gagal mengunggah tanda tangan.');
    } finally {
      setTtdUploading(false);
    }
  };

  const roleLabel = user?.role === 'rt' ? 'RT' : 'RW';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Profil RT/RW"
        subtitle="Informasi akun dan tanda tangan digital Anda"
      />

      {/* ── Identitas ─────────────────────────────────── */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-neutral-900">{user?.nama ?? '—'}</h2>
              <span className="bg-success/10 text-success text-xs font-semibold px-2 py-0.5 rounded-full">
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">@{user?.username ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* ── Info Wilayah ────────────────────────────────── */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Informasi Wilayah
          </h3>
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label={`Nomor ${roleLabel}`} value={user?.role === 'rt' ? user?.no_rt : user?.no_rw} />
          <Field label="Nama Ketua" value={user?.nama} />
          <Field label="ID / Kode" value={user?.id} />
          <Field label="Username" value={user?.username} />
        </dl>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Untuk mengubah data wilayah, hubungi superadmin.
        </p>
      </div>

      {/* ── Tanda Tangan Digital ────────────────────────── */}
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Tanda Tangan Digital
        </h3>

        {/* Notifikasi */}
        {ttdMsg && (
          <div role="alert" className="flex items-center gap-2 bg-success/10 border border-success/20 text-success p-3 rounded-lg mb-4 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {ttdMsg}
          </div>
        )}
        {ttdError && (
          <div role="alert" className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-4 text-sm">
            {ttdError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview TTD saat ini */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">TTD Aktif</p>
            {ttdLoading ? (
              <div className="h-32 bg-neutral-50 animate-pulse rounded-lg" />
            ) : currentTtd ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-neutral-50 min-h-[130px]">
                <img
                  src={currentTtd}
                  alt="Tanda Tangan Digital"
                  className="max-h-28 object-contain mix-blend-multiply"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-neutral-50 min-h-[130px] text-gray-400 text-sm gap-1">
                <span className="text-2xl">✍️</span>
                Belum ada tanda tangan
              </div>
            )}
          </div>

          {/* Form upload TTD baru */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {currentTtd ? 'Perbarui TTD' : 'Unggah TTD Baru'}
            </p>
            <form onSubmit={handleUploadTtd} className="space-y-3">
              <FileDropzone
                accept=".png,.jpg,.jpeg"
                maxMB={2}
                value={ttdFile}
                onChange={setTtdFile}
                hint="PNG berlatar transparan sangat disarankan. Maks 2 MB."
              />
              <button
                type="submit"
                disabled={!ttdFile || ttdUploading}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {ttdUploading ? 'Mengunggah...' : 'Simpan Tanda Tangan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// frontend/src/pages/superadmin/Dashboard.jsx
// POST /api/superadmin/rt — buat akun RT
// POST /api/superadmin/rw — buat akun RW
// GET  /api/template-surat — statistik template

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, PlusCircle, X, CheckCircle } from 'lucide-react';
import { templateService, superadminService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

const INITIAL_FORM = {
  type: 'rt',    // 'rt' | 'rw'
  no_rt: '', no_rw: '', rw_id: '',
  nama_ketua: '', username: '', password: '',
  provinsi: '', kota: '', kecamatan: '', kelurahan_desa: '',
};

export default function SuperadminDashboard() {
  const [templates, setTemplates] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    templateService.getAll()
      .then(res => setTemplates(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const openModal = (type) => {
    setForm({ ...INITIAL_FORM, type });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      if (form.type === 'rt') {
        await superadminService.buatRT({
          no_rt: form.no_rt,
          rw_id: form.rw_id,
          nama_ketua: form.nama_ketua,
          username: form.username,
          password: form.password,
          provinsi: form.provinsi,
          kota: form.kota,
          kecamatan: form.kecamatan,
          kelurahan_desa: form.kelurahan_desa,
        });
        setFormSuccess(`Akun RT berhasil dibuat! Username: ${form.username}`);
      } else {
        await superadminService.buatRW({
          rw_id: form.rw_id,
          no_rw: form.no_rw,
          nama_ketua: form.nama_ketua,
          username: form.username,
          password: form.password,
          provinsi: form.provinsi,
          kota: form.kota,
          kecamatan: form.kecamatan,
          kelurahan_desa: form.kelurahan_desa,
        });
        setFormSuccess(`Akun RW berhasil dibuat! Username: ${form.username}`);
      }
      setForm(prev => ({ ...INITIAL_FORM, type: prev.type }));
    } catch (err) {
      setFormError(err?.message || 'Gagal membuat akun. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Dashboard Superadmin"
        subtitle="Pusat pengelolaan sistem SIPRAGA V2"
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<FileText />}
          label="Template Aktif"
          value={loadingStats ? '...' : templates.length}
          colorClass="text-primary-light"
        />
        <StatCard
          icon={<Users />}
          label="Buat Akun RT"
          value="+"
          colorClass="text-success"
        />
        <StatCard
          icon={<Users />}
          label="Buat Akun RW"
          value="+"
          colorClass="text-warning"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Kelola Template */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manajemen Template</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Unggah, hapus, dan kelola template surat resmi (.docx/.pdf).
              </p>
            </div>
          </div>
          <Link
            to="/superadmin/template"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Kelola Template
          </Link>
        </div>

        {/* Buat Akun RT/RW */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Akun RT / RW</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Tambahkan kredensial login untuk ketua RT dan RW.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('rt')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Buat Akun RT
            </button>
            <button
              onClick={() => openModal('rw')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-warning text-white text-sm font-semibold rounded-lg hover:bg-warning/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Buat Akun RW
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Buat Akun ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-gray-900">
                Buat Akun {form.type === 'rt' ? 'RT' : 'RW'} Baru
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-gray-500 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {formSuccess && (
                <div className="flex items-start gap-2 bg-success/10 border border-success/20 text-success p-3 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Nomor */}
                {form.type === 'rt' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor RT</label>
                    <input
                      name="no_rt" value={form.no_rt} onChange={handleChange} required
                      placeholder="001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor RW</label>
                    <input
                      name="no_rw" value={form.no_rw} onChange={handleChange} required
                      placeholder="001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}

                {/* RW ID (khusus RT) */}
                {form.type === 'rt' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ID RW Induk</label>
                    <input
                      name="rw_id" value={form.rw_id} onChange={handleChange} required
                      placeholder="RW001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ID RW (unik)</label>
                    <input
                      name="rw_id" value={form.rw_id} onChange={handleChange} required
                      placeholder="RW001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
              </div>

              {[
                { name: 'nama_ketua', label: 'Nama Ketua', placeholder: 'Budi Santoso' },
                { name: 'username', label: 'Username Login', placeholder: 'ketuart001' },
                { name: 'password', label: 'Password', placeholder: 'Min. 8 karakter', type: 'password' },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    name={name} value={form[name]} onChange={handleChange} required
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Wilayah</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'provinsi', label: 'Provinsi' },
                  { name: 'kota', label: 'Kota / Kab.' },
                  { name: 'kecamatan', label: 'Kecamatan' },
                  { name: 'kelurahan_desa', label: 'Kelurahan / Desa' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input
                      name={name} value={form[name]} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button" onClick={closeModal} disabled={submitting}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {submitting && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {submitting ? 'Menyimpan...' : `Buat Akun ${form.type.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { suratService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function AjukanSurat() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nik_warga: '', nama_warga: '', jenis_surat: '', alasan: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await suratService.ajukanOffline(fd);
      alert('Surat berhasil dibuat secara offline!');
      navigate('/rtrw/dashboard');
    } catch (err) {
      setError(err?.message || 'Gagal mengajukan surat offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title="Buat Surat Offline" 
        subtitle="Buat surat pengantar secara manual untuk warga yang datang langsung ke lokasi." 
      />

      <div className="bg-white border border-neutral-100 rounded-lg p-6 shadow-sm">
        {error && <div className="mb-4 bg-error/10 text-error p-3 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">NIK Warga</label>
              <input required name="nik_warga" value={form.nik_warga} onChange={handleChange} maxLength={16}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input required name="nama_warga" value={form.nama_warga} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Surat</label>
            <select required name="jenis_surat" value={form.jenis_surat} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih Jenis Surat</option>
              <option value="Surat Pengantar Domisili">Surat Pengantar Domisili</option>
              <option value="Surat Keterangan Usaha">Surat Keterangan Usaha</option>
              <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alasan / Keperluan</label>
            <textarea required name="alasan" value={form.alasan} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="pt-4 text-right">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded text-sm font-semibold shadow-sm hover:bg-primary-dark disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Terbitkan Surat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

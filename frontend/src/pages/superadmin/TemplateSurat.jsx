import { useEffect, useState } from 'react';
import { Info, FileText } from 'lucide-react';
import { templateService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import FileDropzone from '../../components/ui/FileDropzone';
import EmptyState from '../../components/ui/EmptyState';

export default function TemplateSurat() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nama, setNama] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTemplates = () => {
    setLoading(true);
    templateService.getAll()
      .then(res => setTemplates(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!nama || !file) return;
    setUploading(true);
    setMessage('');

    try {
      const fd = new FormData();
      fd.append('nama_template', nama);
      fd.append('file', file);
      await templateService.upload(fd);
      setMessage('Template berhasil diunggah.');
      setNama('');
      setFile(null);
      fetchTemplates();
    } catch (err) {
      setMessage(err?.message || 'Gagal mengunggah template.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus template ini?')) return;
    try {
      await templateService.hapus(id);
      fetchTemplates();
    } catch (err) {
      alert(err?.message || 'Gagal menghapus template');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pengelolaan Template Surat" 
        subtitle="Kelola dokumen template acuan (.docx/.pdf) untuk digunakan di sistem." 
      />

      {message && (
        <div className="bg-primary-light/10 text-primary-dark p-4 rounded-lg text-sm border border-primary/20">
          <Info className="inline w-4 h-4 mr-1" /> {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
            <h3 className="text-base font-semibold text-gray-800">Daftar Template Aktif</h3>
          </div>
          
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse flex h-12 bg-neutral-50 rounded" />)}
            </div>
          ) : templates.length === 0 ? (
            <EmptyState icon={<FileText className="w-12 h-12 text-gray-300"/>} title="Belum ada template" description="Silakan unggah template pertama Anda di sebelah kanan." />
          ) : (
            <div className="divide-y divide-gray-100">
              {templates.map(t => (
                <div key={t.id} className="p-5 flex items-center justify-between hover:bg-primary-light/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{t.nama_template || t.nama}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{t.filename || t.file_name || '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={templateService.getDownloadUrl(t.id)} 
                      target="_blank" rel="noopener noreferrer"
                      className="p-2 text-primary-light bg-primary-light/10 hover:bg-primary-light/20 rounded"
                    >
                      Unduh
                    </a>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-error bg-error/10 hover:bg-error/20 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-neutral-100 rounded-lg shadow-sm p-5 self-start">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Unggah Template</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama / Deskripsi</label>
              <input required value={nama} onChange={e => setNama(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">File Dokumen</label>
              <FileDropzone 
                accept=".docx,.pdf" 
                maxMB={5} 
                value={file} 
                onChange={setFile} 
                hint="Maksimal 5MB"
              />
            </div>
            <button
              type="submit"
              disabled={!nama || !file || uploading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded shadow-sm disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Mengunggah...' : 'Unggah & Simpan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

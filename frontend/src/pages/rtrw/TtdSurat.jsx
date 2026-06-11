import { useEffect, useState } from 'react';
import { ttdService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import FileDropzone from '../../components/ui/FileDropzone';

export default function TtdSurat() {
  const [currentTtd, setCurrentTtd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTtd = () => {
    setLoading(true);
    ttdService.getCurrentTTD()
      .then(res => {
        const data = res.data ?? res;
        if (data?.ttd_url) setCurrentTtd(data.ttd_url);
        else if (data?.data?.ttd_url) setCurrentTtd(data.data.ttd_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTtd();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage('');
    
    try {
      const fd = new FormData();
      fd.append('ttdImage', file);
      await ttdService.uploadTTD(fd);
      setMessage('Tanda tangan berhasil diunggah.');
      setFile(null);
      fetchTtd();
    } catch (err) {
      setMessage(err?.message || 'Gagal mengunggah tanda tangan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Tanda Tangan Digital" 
        subtitle="Unggah tanda tangan transparan (PNG) untuk digunakan secara otomatis pada surat pengantar." 
      />

      {message && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-5 text-sm border border-blue-200">
          ℹ️ {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">Tanda Tangan Saat Ini</h3>
          {loading ? (
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ) : currentTtd ? (
            <div className="border border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center bg-gray-50 min-h-[150px]">
              <img src={currentTtd} alt="Tanda Tangan" className="max-h-32 object-contain mix-blend-multiply" />
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center bg-gray-50 min-h-[150px] text-gray-400 text-sm">
              Belum ada tanda tangan
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">Perbarui Tanda Tangan</h3>
          <form onSubmit={handleUpload}>
            <FileDropzone 
              accept=".png,.jpg,.jpeg" 
              maxMB={2} 
              value={file} 
              onChange={setFile} 
              hint="Format PNG berlatar transparan disarankan"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="mt-4 w-full py-2.5 bg-[#1A4A8A] hover:bg-[#0F2D5C] text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Mengunggah...' : 'Simpan Tanda Tangan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

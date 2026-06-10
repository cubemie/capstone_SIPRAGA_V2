import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Check, Upload, Trash2, Edit3, Eraser, Loader2, AlertCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { ttdService } from '../../services/ttdService';

export default function TtdSurat() {
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const sigCanvas = useRef({});

  useEffect(() => {
    fetchTtd();
  }, []);

  const fetchTtd = async () => {
    setLoading(true);
    const { data, error: err } = await ttdService.getCurrentTtd();
    setLoading(false);
    // Jika tidak ada error dan data ada ttd_url, tampilkan. 
    // Jika error (misal "Tanda tangan belum diunggah"), maka tidak apa-apa, biarkan null.
    if (!err && data?.data?.ttd_url) {
      setSignatureUrl(data.data.ttd_url);
    } else if (!err && data?.ttd_url) {
      setSignatureUrl(data.ttd_url);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current && typeof sigCanvas.current.clear === 'function') {
      sigCanvas.current.clear();
    }
    setError('');
  };

  const handleSaveDrawing = async () => {
    // Debug: log isi sigCanvas ref
    console.log('[TTD] sigCanvas.current:', sigCanvas.current);
    console.log('[TTD] isEmpty:', sigCanvas.current?.isEmpty?.());

    // Cek apakah canvas kosong — gunakan fallback jika isEmpty tidak tersedia
    const isEmpty = typeof sigCanvas.current?.isEmpty === 'function'
      ? sigCanvas.current.isEmpty()
      : false;

    if (isEmpty) {
      setError('Tanda tangan masih kosong.');
      return;
    }
    setError('');
    setSaving(true);
    
    try {
      // Dapatkan raw canvas — getTrimmedCanvas() broken di react-signature-canvas@1.1.0-alpha.2
      // Gunakan getCanvas() sebagai gantinya
      let canvas;
      if (typeof sigCanvas.current?.getCanvas === 'function') {
        canvas = sigCanvas.current.getCanvas();
      } else {
        throw new Error('Canvas method tidak ditemukan pada ref.');
      }

      console.log('[TTD] canvas dimensions:', canvas.width, 'x', canvas.height);

      // Encode canvas sebagai PNG agar background tetap transparan (karena JPEG tidak dukung transparan)
      const dataURL = canvas.toDataURL('image/png');
      
      // Konversi dataURL → Blob
      const byteString = atob(dataURL.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('ttdImage', blob, 'signature.png');
      
      const { data, error: err } = await ttdService.uploadTtd(formData);
      
      setSaving(false);
      
      if (err) {
        setError(err);
        return;
      }
      
      setIsSaved(true);
      if (data?.data?.ttd_url) setSignatureUrl(data.data.ttd_url);
      else if (data?.ttd_url) setSignatureUrl(data.ttd_url);
      
      setIsDrawing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('[TTD] Gagal simpan tanda tangan:', e);
      setSaving(false);
      setError('Gagal memproses gambar tanda tangan.');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError('');
    setSaving(true);
    
    const formData = new FormData();
    formData.append('ttdImage', file);
    
    const { data, error: err } = await ttdService.uploadTtd(formData);
    
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    
    setIsSaved(true);
    if (data?.data?.ttd_url) setSignatureUrl(data.data.ttd_url);
    else if (data?.ttd_url) setSignatureUrl(data.ttd_url);
    
    setIsDrawing(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/rtrw/dashboard" className="text-slate-400 hover:text-slate-900 transition p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Tanda Tangan Digital</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tanda Tangan Digital (E-Signature)</h3>
          <p className="text-slate-500 text-sm">
            Buat tanda tangan langsung di layar atau unggah file gambar berlatar transparan (PNG) untuk ditempelkan secara otomatis pada surat pengantar.
          </p>
        </div>

        {/* Alerts */}
        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Tanda tangan digital berhasil diperbarui dan aktif!</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Memuat data tanda tangan...</span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50 min-h-[300px] relative overflow-hidden">
            {!isDrawing && signatureUrl ? (
              <div className="text-center space-y-6 w-full">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanda Tangan Aktif Anda</p>
                <div className="bg-white p-6 border border-slate-200 rounded-xl max-w-sm mx-auto shadow-sm flex items-center justify-center min-h-[150px]">
                  <img src={signatureUrl} alt="Digital Signature" className="max-h-40 object-contain" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsDrawing(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition text-sm flex items-center justify-center shadow"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Buat Ulang (Gambar)
                  </button>
                  <label className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300 transition text-sm flex items-center justify-center cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Unggah File Baru
                    <input type="file" accept="image/png, image/jpeg" className="sr-only" onChange={handleUpload} disabled={saving} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 w-full">
                <div className="flex justify-between items-end mb-2 max-w-lg mx-auto">
                   <p className="text-sm font-bold text-slate-700 text-left">Gambar Tanda Tangan Anda di Bawah:</p>
                   <button onClick={handleClear} className="text-xs flex items-center text-rose-600 hover:text-rose-700 font-semibold">
                      <Eraser className="w-3 h-3 mr-1"/> Bersihkan
                   </button>
                </div>
                
                <div className="bg-white border-2 border-slate-300 rounded-xl shadow-inner overflow-hidden max-w-lg mx-auto touch-none">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                      width: 600,
                      height: 250,
                      style: { width: '100%', height: 'auto', display: 'block' },
                    }} 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  {signatureUrl && (
                    <button
                      onClick={() => { setIsDrawing(false); setError(''); }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition text-sm"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    onClick={handleSaveDrawing}
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition text-sm flex items-center justify-center shadow disabled:opacity-70"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><Award className="w-4 h-4 mr-2" /> Simpan Tanda Tangan</>}
                  </button>
                  
                  <span className="text-slate-300 mx-2 hidden sm:block">|</span>
                  
                  <label className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl hover:bg-slate-200 transition text-sm flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-70">
                    <Upload className="w-4 h-4 mr-2" />
                    Atau Unggah Gambar
                    <input type="file" accept="image/png, image/jpeg" className="sr-only" onChange={handleUpload} disabled={saving} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

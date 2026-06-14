import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eraser, Save, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { getTtd, uploadTtd } from '../../services/ttdService';
import { useAuth } from '../../context/AuthContext';

const dataURLtoBlob = (dataUrl) => {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/png';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
};

export default function TtdSurat() {
  const { user } = useAuth();
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('draw');
  const [drawing, setDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: ttdData, isLoading } = useQuery({
    queryKey: ['ttd'],
    queryFn: getTtd,
  });

  const hasSaved = !!ttdData?.data?.ttd_url;
  const previewUrl = ttdData?.data?.ttd_url || '';

  const loadSignatureProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ['ttd'] });
  };

  const getPoint = (e) => {
    const canvas = sigCanvas.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    setDrawing(true);
    const canvas = sigCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = sigCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1a2e26';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = sigCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return !imageData.data.some(channel => channel !== 0);
};

const handleSaveCanvas = async () => {
    if (!sigCanvas.current) return;
    if (isCanvasEmpty(sigCanvas.current)) {
      toast.error('Tanda tangan masih kosong');
      return;
    }

    setSaving(true);
    try {
      const canvas = sigCanvas.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Gagal membuat gambar tanda tangan');

      const formData = new FormData();
      formData.append('ttdImage', blob, 'signature.png');
      await uploadTtd(formData);
      await loadSignatureProfile();
      toast.success('Tanda tangan berhasil disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan tanda tangan');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('ttdImage', file);
    uploadTtd(formData)
      .then(() => {
        loadSignatureProfile();
        toast.success('Tanda tangan berhasil disimpan');
      })
      .catch(() => toast.error('Gagal menyimpan tanda tangan'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-4">Profil &middot; Tanda Tangan</p>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-serif text-gray-900 mb-3">
            Tanda tangan <span className="italic">resmi</span> Anda.
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Goresan ini akan tertaut pada setiap surat yang Anda setujui.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column - Canvas/Upload */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'upload'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('draw')}
                  className={`pb-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'draw'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Gambar TTD
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'upload' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleUploadFile}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-12 text-gray-500 hover:border-blue-500 hover:text-blue-700 transition-colors flex flex-col items-center justify-center"
                  >
                    <p className="text-sm mt-1">Klik untuk pilih file PNG/JPG</p>
                  </button>
                </div>
              )}

              {activeTab === 'draw' && (
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg relative touch-none group">
                    <canvas
                      ref={sigCanvas}
                      width={800}
                      height={300}
                      className="w-full h-auto cursor-crosshair"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                    />
                    
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="text-2xl font-serif italic text-gray-200 transition-opacity group-hover:opacity-0">Tanda tangan di sini</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 text-center sm:text-left">
                      Anda dapat memperbarui tanda tangan kapan saja.<br />
                      Pastikan goresan terlihat jelas.
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button" 
                        onClick={clearCanvas}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
                      >
                        <Eraser className="w-4 h-4" />
                        Ulang
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSaveCanvas}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <PenTool className="w-4 h-4 animate-pulse" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan Goresan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-serif text-gray-900">Pratinjau Tersimpan</h3>
              <div className="flex items-center gap-2 text-[10px] tracking-widest text-gray-500 uppercase">
                {hasSaved ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Aktif</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Kosong</>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 flex items-center justify-center mb-6">
                {!isLoading && previewUrl ? (
                  <img src={previewUrl} alt="Preview tanda tangan" className="max-h-32 object-contain" />
                ) : (
                  <span className="text-sm text-gray-400 italic font-serif">Belum ada tanda tangan</span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Disertifikasi oleh</span>
                  <span className="text-gray-900 font-medium font-mono">SIPRAGA Secure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-bold tracking-widest text-gray-700 uppercase mb-3">Catatan Keamanan</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tanda tangan Anda hanya digunakan pada surat yang Anda setujui secara eksplisit.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

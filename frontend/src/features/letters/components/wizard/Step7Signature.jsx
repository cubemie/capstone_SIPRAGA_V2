import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../../../../utils/api';

export default function Step7Signature({ draftUuid, letterId }) {
  const sigCanvas = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      // 1. Submit final (Ubah status dari draft -> submitted)
      await api.post(`/v2/letters/${draftUuid}/submit`);
      // 2. Upload signature jika ada endpoint (opsional sesuai backend)
      return true;
    },
    onSuccess: () => {
      toast.success('Surat berhasil diajukan!');
      navigate('/letters');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Gagal mengajukan surat.');
    },
  });

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleSubmit = () => {
    if (sigCanvas.current.isEmpty()) {
      setError('Tanda tangan wajib diisi');
      return;
    }
    
    setError(null);
    const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    // TODO: Kirim signatureDataUrl ke backend jika diperlukan.
    // Saat ini, backend langsung /submit. Kita panggil mutasinya.
    submitMutation.mutate({ signature: signatureDataUrl });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Tanda Tangan Pemohon</h2>
        <p className="text-sm text-gray-500 mt-1">
          Silakan tanda tangan di dalam kotak di bawah ini untuk mengesahkan pengajuan surat.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-2">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 bg-white rounded cursor-crosshair touch-none',
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Hapus Ulang
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Mengajukan...' : 'Selesai & Ajukan'}
        </button>
      </div>
    </div>
  );
}

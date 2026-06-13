import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import { getTtd, uploadTtd } from '../../services/ttdService';

const dataURLtoBlob = (dataUrl) => {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
};

export default function TtdSurat() {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'draw'
  const queryClient = useQueryClient();

  const { data: ttdData } = useQuery({
    queryKey: ['ttd'],
    queryFn: getTtd,
  });

  const mutation = useMutation({
    mutationFn: uploadTtd,
    onSuccess: () => {
      toast.success('TTD berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['ttd'] });
    },
    onError: () => toast.error('Gagal menyimpan TTD'),
  });

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('ttdImage', file);
    mutation.mutate(formData);
  };

  const handleSaveCanvas = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error('Tanda tangan masih kosong');
      return;
    }
    const dataUrl = sigCanvas.current.toDataURL('image/png');
    const blob = dataURLtoBlob(dataUrl);
    const formData = new FormData();
    formData.append('ttdImage', blob, 'ttd.png');
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6">Tanda Tangan Digital</h1>

      {/* TTD Tersimpan */}
      {ttdData?.ttd_digital && (
        <div className="mb-6 p-4 border rounded-lg bg-[var(--color-surface-muted)]">
          <p className="text-sm font-medium text-[var(--color-ink-secondary)] mb-2">TTD Saat Ini</p>
          <img
            src={ttdData.ttd_digital}
            alt="TTD Tersimpan"
            className="max-h-24 border rounded bg-[var(--color-surface-card)] p-2"
          />
        </div>
      )}

      {/* Tab */}
      <div className="flex gap-2 border-b mb-4">
        {[
          { key: 'upload', label: 'Upload File' },
          { key: 'draw', label: 'Gambar TTD' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === tab.key
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-ink-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleUploadFile}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={mutation.isPending}
            className="w-full border-2 border-dashed border-[var(--color-surface-border)] rounded-lg py-12 text-[var(--color-ink-muted)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] transition-colors"
          >
            <p className="text-lg">📎</p>
            <p className="text-sm mt-1">Klik untuk pilih file PNG/JPG</p>
          </button>
        </div>
      )}

      {activeTab === 'draw' && (
        <div>
          <div className="border rounded-lg overflow-hidden bg-[var(--color-surface-card)] mb-3">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 560,
                height: 200,
                className: 'w-full',
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => sigCanvas.current.clear()}
              className="flex-1 border border-[var(--color-surface-border)] text-[var(--color-ink-secondary)] py-2 rounded-lg text-sm hover:bg-[var(--color-surface-muted)]"
            >
              Hapus
            </button>
            <button
              onClick={handleSaveCanvas}
              disabled={mutation.isPending}
              className="flex-1 bg-[var(--color-primary)] text-white py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan TTD'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

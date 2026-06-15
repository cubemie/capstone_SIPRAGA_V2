import { X, AlertCircle, Send } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  data = {}
}) {
  if (!isOpen) return null;

  const { jenisSurat, alurPersetujuan, subjek, keperluan, jumlahLampiran, namaPemohon, nik } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Konfirmasi Pengajuan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            Pastikan data berikut sudah benar. Setelah dikirim, surat akan diteruskan ke RT untuk diverifikasi.
          </p>

          <div className="bg-[var(--color-surface-muted)] rounded-xl divide-y divide-[var(--color-surface-border)] text-sm overflow-hidden">
            {[
              { label: 'Jenis Surat', value: jenisSurat },
              { label: 'Alur Persetujuan', value: alurPersetujuan },
              { label: 'Subjek', value: subjek },
              { label: 'Keperluan', value: keperluan },
              { label: 'Nama Pemohon', value: namaPemohon },
              { label: 'NIK', value: nik },
              { label: 'Lampiran', value: `${jumlahLampiran || 0} dokumen` },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 px-4 py-3">
                <span className="text-[var(--color-ink-secondary)] w-36 flex-shrink-0">{label}</span>
                <span className="text-[var(--color-ink)] font-medium break-words">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface-muted)] border-t border-[var(--color-surface-border)] flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-[var(--color-surface-border)] text-sm font-medium text-[var(--color-ink)] hover:bg-white transition-colors disabled:opacity-50"
          >
            Kembali Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Pengajuan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

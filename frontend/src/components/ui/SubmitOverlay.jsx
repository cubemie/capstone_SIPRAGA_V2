import { Loader2 } from 'lucide-react';

const STEPS_LABEL = [
  'Menyimpan data surat...',
  'Mengunggah lampiran...',
  'Mengirim ke RT...',
];

export default function SubmitOverlay({ isVisible, currentStep = 0 }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
          Mengirim Pengajuan...
        </h3>
        <p className="text-sm text-[var(--color-ink-secondary)] mb-6">
          {STEPS_LABEL[currentStep] || 'Memproses...'}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS_LABEL.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300
                ${i <= currentStep
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-border)]'
                }
              `}
            />
          ))}
        </div>

        <p className="text-xs text-[var(--color-ink-muted)] mt-4">
          Mohon jangan menutup halaman ini
        </p>
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';

const STEPS = [
  { key: 'type', label: 'Jenis Surat', shortLabel: '1' },
  { key: 'data', label: 'Isi Data', shortLabel: '2' },
  { key: 'content', label: 'Isi Surat', shortLabel: '3' },
  { key: 'attachments', label: 'Lampiran', shortLabel: '4' },
  { key: 'workflow', label: 'Alur', shortLabel: '5' },
  { key: 'review', label: 'Kirim', shortLabel: '6' },
];

export default function WizardStepper({ completedSteps = [] }) {
  return (
    <div className="w-full px-4 py-3 bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)]">
      {/* Mobile: horizontal pill steps */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {STEPS.map((step, index) => {
          const isDone = completedSteps.includes(step.key);
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-0.5">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isDone
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]'
                  }
                `}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.shortLabel}
                </div>
                <span className={`text-[10px] hidden sm:block font-medium whitespace-nowrap
                  ${isDone ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-muted)]'}
                `}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`w-6 sm:w-10 h-0.5 mb-3 sm:mb-0 flex-shrink-0 transition-all
                  ${isDone ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-border)]'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

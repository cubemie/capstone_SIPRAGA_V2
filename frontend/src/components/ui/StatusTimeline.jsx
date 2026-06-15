import { Check, Clock, X, RotateCcw, FileText, Send, ShieldCheck } from 'lucide-react';

const STATUS_CONFIG = {
  draft:                { label: 'Surat Dibuat',            icon: FileText,    color: 'text-gray-500',   bg: 'bg-gray-100' },
  submitted:            { label: 'Menunggu Verifikasi RT',  icon: Send,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
  in_review_rt:         { label: 'RT Sedang Memproses',     icon: Clock,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  approved_rt:          { label: 'RT Menyetujui',           icon: Check,       color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  in_review_rw:         { label: 'RW Sedang Memproses',     icon: Clock,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
  approved_rw:          { label: 'RW Menyetujui',           icon: Check,       color: 'text-purple-600', bg: 'bg-purple-50' },
  revision_requested:   { label: 'Perlu Revisi',            icon: RotateCcw,   color: 'text-orange-600', bg: 'bg-orange-50' },
  rejected:             { label: 'Ditolak',                 icon: X,           color: 'text-red-600',    bg: 'bg-red-50' },
  completed:            { label: 'Surat Selesai',           icon: ShieldCheck, color: 'text-emerald-600',bg: 'bg-emerald-50' },
};

// Step order default (RT_ONLY workflow)
const WORKFLOW_STEPS = {
  RT_ONLY: ['draft', 'submitted', 'in_review_rt', 'completed'],
  RT_THEN_RW: ['draft', 'submitted', 'in_review_rt', 'approved_rt', 'in_review_rw', 'completed'],
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function StatusTimeline({ status, workflowCode = 'RT_ONLY', approvals = [], createdAt }) {
  const steps = WORKFLOW_STEPS[workflowCode] || WORKFLOW_STEPS.RT_ONLY;

  // Handle rejected/revision status: tampilkan di akhir sebagai terminal state
  const isTerminalBad = ['rejected', 'revision_requested'].includes(status);
  const displaySteps = isTerminalBad ? [...steps, status] : steps;

  const currentIndex = displaySteps.indexOf(status);

  return (
    <div className="space-y-0">
      {displaySteps.map((step, index) => {
        const config = STATUS_CONFIG[step] || STATUS_CONFIG.draft;
        const Icon = config.icon;
        const isDone = index < currentIndex || (index === currentIndex && ['completed', 'rejected'].includes(step));
        const isCurrent = index === currentIndex && !['completed', 'rejected'].includes(status);
        const isPending = index > currentIndex;
        const isLast = index === displaySteps.length - 1;

        // Cari approval data untuk step ini
        const relatedApproval = approvals?.find(a => {
          if (step === 'approved_rt' || step === 'in_review_rt') return a.step === 1;
          if (step === 'approved_rw' || step === 'in_review_rw') return a.step === 2;
          return false;
        });

        return (
          <div key={step} className="flex gap-3">
            {/* Left: Icon + Line */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${isDone ? `${config.bg} ${config.color}` : ''}
                ${isCurrent ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current` : ''}
                ${isPending ? 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]' : ''}
              `}>
                {isDone && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-6 mt-1 transition-all
                  ${isDone || isCurrent ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-border)]'}
                `} />
              )}
            </div>

            {/* Right: Content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-semibold leading-8
                ${isDone ? config.color : ''}
                ${isCurrent ? config.color : ''}
                ${isPending ? 'text-[var(--color-ink-muted)]' : ''}
              `}>
                {config.label}
                {isCurrent && (
                  <span className="ml-2 text-xs bg-current/10 rounded-full px-2 py-0.5 font-medium">
                    Sekarang
                  </span>
                )}
              </p>

              {/* Timestamp */}
              {step === 'draft' && createdAt && (
                <p className="text-xs text-[var(--color-ink-muted)]">{formatDate(createdAt)}</p>
              )}
              {relatedApproval?.acted_at && (
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {relatedApproval.approver_name} · {formatDate(relatedApproval.acted_at)}
                </p>
              )}
              {relatedApproval?.notes && (
                <p className="text-xs text-[var(--color-ink-secondary)] mt-0.5 italic">
                  "{relatedApproval.notes}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

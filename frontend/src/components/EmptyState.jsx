import { FileText } from 'lucide-react';

export default function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 bg-[var(--color-surface-muted)] rounded-full flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-[var(--color-ink-muted)]" />
      </div>
      <h3 className="font-semibold text-[var(--color-ink)] text-sm mb-1">{title}</h3>
      {description && <p className="text-[var(--color-ink-muted)] text-xs max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

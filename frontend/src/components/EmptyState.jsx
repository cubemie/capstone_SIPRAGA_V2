import { FileText } from 'lucide-react';

export default function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 text-sm mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-xs max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
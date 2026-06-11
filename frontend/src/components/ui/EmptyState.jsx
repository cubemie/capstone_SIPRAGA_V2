import { FileText } from 'lucide-react';

const EmptyState = ({ icon = <FileText className="w-12 h-12 text-gray-300" />, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4 opacity-40" aria-hidden="true">{icon}</span>
    <p className="text-base font-medium text-secondary mb-1">{title}</p>
    {description && <p className="text-sm text-gray-400 mb-5 max-w-xs">{description}</p>}
    {action}
  </div>
);

export default EmptyState;

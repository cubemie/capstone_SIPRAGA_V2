const StatCard = ({ icon, label, value, colorClass = 'text-primary-dark' }) => (
  <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm flex flex-col gap-2">
    <span className={`text-2xl ${colorClass}`}>{icon}</span>
    <span className="text-3xl font-bold text-neutral-900">{value ?? '—'}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default StatCard;

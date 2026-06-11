const StatCard = ({ icon, label, value, colorClass = 'text-blue-800' }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col gap-2">
    <span className={`text-2xl ${colorClass}`}>{icon}</span>
    <span className="text-3xl font-bold text-gray-900">{value ?? '—'}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default StatCard;

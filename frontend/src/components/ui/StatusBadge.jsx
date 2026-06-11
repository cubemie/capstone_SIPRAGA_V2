const config = {
  1: {
    label: 'Menunggu',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
    aria: 'Status: Menunggu persetujuan',
  },
  2: {
    label: 'Disetujui',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    aria: 'Status: Disetujui',
  },
  3: {
    label: 'Ditolak',
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    aria: 'Status: Ditolak',
  },
};

const StatusBadge = ({ status }) => {
  const c = config[status] ?? config[1];
  return (
    <span
      aria-label={c.aria}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
      {c.label}
    </span>
  );
};

export default StatusBadge;

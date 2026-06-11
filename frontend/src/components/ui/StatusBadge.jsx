const config = {
  1: {
    label: 'Menunggu',
    bg: 'bg-yellow-100',
    text: 'text-warning',
    dot: 'bg-warning/100',
    aria: 'Status: Menunggu persetujuan',
  },
  2: {
    label: 'Disetujui',
    bg: 'bg-green-100',
    text: 'text-success',
    dot: 'bg-success',
    aria: 'Status: Disetujui',
  },
  3: {
    label: 'Ditolak',
    bg: 'bg-error/20',
    text: 'text-error',
    dot: 'bg-error',
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

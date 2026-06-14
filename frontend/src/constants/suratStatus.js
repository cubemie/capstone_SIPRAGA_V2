/**
 * Mapping status surat dari integer database ke label UI.
 * Backend: status tinyint 1=MENUNGGU, 2=DISETUJUI, 3=DITOLAK
 */

export const SURAT_STATUS = {
  MENUNGGU:  1,
  DISETUJUI: 2,
  DITOLAK:   3,
};

export const STATUS_LABEL = {
  1: 'Menunggu Verifikasi',
  2: 'Disetujui',
  3: 'Ditolak',
};

export const STATUS_COLOR = {
  1: 'bg-amber-100 text-amber-800 border-amber-200',
  2: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  3: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const LETTER_STATUS_V2 = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Menunggu RT', color: 'bg-yellow-100 text-yellow-700' },
  in_review_rt: { label: 'Diproses RT', color: 'bg-blue-100 text-blue-700' },
  approved_rt: { label: 'Disetujui RT', color: 'bg-cyan-100 text-cyan-700' },
  in_review_rw: { label: 'Diproses RW', color: 'bg-indigo-100 text-indigo-700' },
  approved_rw: { label: 'Disetujui RW', color: 'bg-purple-100 text-purple-700' },
  revision_requested: { label: 'Perlu Revisi', color: 'bg-orange-100 text-orange-700' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-200 text-gray-500' },
};

export const getStatusV2 = (statusKey) => {
  return LETTER_STATUS_V2[statusKey] || { label: statusKey || 'Unknown', color: 'bg-gray-100 text-gray-600' };
};
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
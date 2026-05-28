/**
 * suratStatus.js
 *
 * Konstanta status pengajuan surat.
 * Gunakan ini sebagai pengganti magic number di model dan service.
 *
 * @example
 *   const { MENUNGGU, DISETUJUI, DITOLAK } = require('../constants/suratStatus');
 *   WHERE status = ${MENUNGGU}
 */

const SURAT_STATUS = {
  MENUNGGU:  1,
  DISETUJUI: 2,
  DITOLAK:   3,
};

module.exports = SURAT_STATUS;

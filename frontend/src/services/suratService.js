/**
 * suratService
 *
 * Mengelola semua operasi terkait surat pengantar:
 * - Warga: ajukan surat, lihat status, statistik
 * - RT/RW: lihat surat masuk, approve/reject, lihat riwayat, buat surat offline
 *
 * PENTING: Semua endpoint diselaraskan dengan backend routes yang aktual.
 */

import { api } from '../utils/api';

export const suratService = {
  // ─── Warga ────────────────────────────────────────────────────────────────

  /**
   * Ambil semua surat milik warga yang sedang login.
   * BE route: GET /api/surat/milik-saya
   */
  getMySurat: () =>
    api.get('/surat/milik-saya'),

  /**
   * Ajukan surat baru oleh warga (dengan upload file dokumen pendukung).
   * BE route: POST /api/surat/ajukan  (field: fileSurat)
   * @param {FormData} formData — berisi subjek, provinsi, kota, kecamatan, kelurahan, rt, rw, fileSurat
   */
  ajukanSurat: (formData) =>
    api.postFormData('/surat/ajukan', formData),

  /**
   * Ambil statistik surat milik warga (total, menunggu, disetujui, ditolak).
   * BE route: GET /api/surat/statistik
   */
  getStatistik: () =>
    api.get('/surat/statistik'),

  // ─── RT/RW ────────────────────────────────────────────────────────────────

  /**
   * Ambil daftar surat masuk yang butuh diverifikasi (role RT/RW).
   * BE route: GET /api/surat/masuk
   */
  getSuratMasuk: () =>
    api.get('/surat/masuk'),

  /**
   * Ambil daftar surat yang menunggu tanda tangan.
   * BE route: GET /api/surat/menunggu-ttd
   */
  getSuratMenungguTtd: () =>
    api.get('/surat/menunggu-ttd'),

  /**
   * Setujui + upload surat tertandatangani.
   * BE route: POST /api/surat/tanda-tangani/:id  (field: fileSurat)
   * @param {number|string} id
   * @param {FormData} formData — berisi fileSurat (PDF/DOCX hasil TTD)
   */
  approveSurat: (id, formData) =>
    api.postFormData(`/surat/tanda-tangani/${id}`, formData),

  /**
   * Tolak surat berdasarkan ID dengan alasan penolakan.
   * BE route: POST /api/surat/tolak/:id
   * @param {number|string} id
   * @param {string} alasan
   */
  rejectSurat: (id, alasan) =>
    api.post(`/surat/tolak/${id}`, { alasan }),

  /**
   * Ambil riwayat semua surat yang sudah diproses (DISETUJUI/DITOLAK).
   * BE route: GET /api/surat/riwayat-rtrw
   */
  getRiwayat: () =>
    api.get('/surat/riwayat-rtrw'),

  /**
   * Buat surat pengantar offline untuk warga yang datang langsung (oleh RT/RW).
   * BE route: POST /api/surat/offline
   * @param {{ nik_warga: string, nama_warga: string, jenis_surat: string, alasan: string }} data
   */
  ajukanSuratOffline: (data) =>
    api.post('/surat/offline', data),
};

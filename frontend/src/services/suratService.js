/**
 * suratService
 *
 * Mengelola semua operasi terkait surat pengantar:
 * - Warga: ajukan surat, lihat status
 * - RT/RW: lihat surat masuk, approve/reject, lihat riwayat, buat surat offline
 */

import { api } from '../utils/api';

export const suratService = {
  // ─── Warga ────────────────────────────────────────────────────────────────

  /**
   * Ambil semua surat milik warga yang sedang login.
   */
  getMySurat: () =>
    api.get('/surat/my'),

  /**
   * Ajukan surat baru oleh warga (dengan upload file dokumen pendukung).
   * @param {FormData} formData — berisi subjek, template_id, dan file
   */
  ajukanSurat: (formData) =>
    api.postFormData('/surat', formData),

  // ─── RT/RW ────────────────────────────────────────────────────────────────

  /**
   * Ambil daftar surat masuk yang butuh diverifikasi (role RT/RW).
   */
  getSuratMasuk: () =>
    api.get('/surat/masuk'),

  /**
   * Setujui surat berdasarkan ID.
   * @param {number|string} id
   */
  approveSurat: (id) =>
    api.patch(`/surat/${id}/approve`, {}),

  /**
   * Tolak surat berdasarkan ID dengan alasan penolakan.
   * @param {number|string} id
   * @param {string} alasan
   */
  rejectSurat: (id, alasan) =>
    api.patch(`/surat/${id}/reject`, { alasan }),

  /**
   * Ambil riwayat semua surat yang sudah diproses.
   */
  getRiwayat: () =>
    api.get('/surat/riwayat'),

  /**
   * Buat surat pengantar offline untuk warga yang datang langsung (oleh RT/RW).
   * @param {{ nik_warga: string, nama_warga: string, jenis_surat: string, alasan: string }} data
   */
  ajukanSuratOffline: (data) =>
    api.post('/surat/offline', data),
};

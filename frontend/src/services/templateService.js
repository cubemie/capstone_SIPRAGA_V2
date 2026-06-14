/**
 * templateService
 *
 * Mengelola semua operasi template surat resmi (hanya superadmin).
 * - Ambil daftar template
 * - Upload template baru
 * - Hapus template
 * - Download template
 */

import { api } from '../utils/api';

export const templateService = {
  /**
   * Ambil semua template surat yang tersedia.
   */
  getAll: () =>
    api.get('/template-surat'),

  /**
   * Upload template surat baru.
   * @param {FormData} formData — berisi nama_template dan file
   */
  upload: (formData) =>
    api.postFormData('/template-surat', formData),

  /**
   * Hapus template surat berdasarkan ID.
   * @param {number|string} id
   */
  deleteById: (id) =>
    api.delete(`/template-surat/${id}`),

  /**
   * Download template surat berdasarkan ID.
   * Mengembalikan URL download langsung.
   * @param {number|string} id
   */
  getDownloadUrl: (id) =>
    `/api/template-surat/${id}/download`,
};

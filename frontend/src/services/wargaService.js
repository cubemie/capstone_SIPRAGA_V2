/**
 * wargaService
 *
 * Mengelola operasi terkait data profil warga.
 * Siap digunakan untuk fitur berikutnya (edit profil, daftar warga, dll).
 */

import { api } from '../utils/api';

export const wargaService = {
  /**
   * Ambil profil warga yang sedang login.
   */
  getProfile: () =>
    api.get('/warga/profile'),

  /**
   * Update profil warga yang sedang login.
   * @param {{ nama?: string, email?: string, alamat?: string }} data
   */
  updateProfile: (data) =>
    api.put('/warga/profile', data),
};

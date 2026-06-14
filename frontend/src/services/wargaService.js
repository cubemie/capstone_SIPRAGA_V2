/**
 * wargaService
 *
 * Mengelola operasi terkait data profil warga.
 * Semua endpoint diselaraskan dengan backend routes: /api/warga/*
 */

import { api } from '../utils/api';

export const wargaService = {
  /**
   * Ambil profil warga yang sedang login.
   * BE route: GET /api/warga/profil
   */
  getProfil: () =>
    api.get('/warga/profil'),

  /**
   * Cek apakah data warga sudah lengkap.
   * BE route: GET /api/warga/kelengkapan-data
   */
  getKelengkapanData: () =>
    api.get('/warga/kelengkapan-data'),

  /**
   * Lengkapi / update data warga + upload foto KTP.
   * BE route: PUT /api/warga/lengkapi-data  (multipart/form-data)
   * @param {FormData} formData — berisi semua field data warga + foto_ktp
   */
  lengkapiData: (formData) =>
    api.putFormData('/warga/lengkapi-data', formData),
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.putFormData('/auth/profile', data);
  return res.data;
};

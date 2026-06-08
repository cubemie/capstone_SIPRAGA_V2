import { api } from '../utils/api';

export const ttdService = {
  /**
   * Ambil tanda tangan digital saat ini.
   * BE route: GET /api/ttd/current-ttd
   */
  getCurrentTtd: () =>
    api.get('/ttd/current-ttd'),

  /**
   * Upload / simpan tanda tangan digital baru.
   * BE route: POST /api/ttd/upload-ttd (multipart/form-data)
   * @param {FormData} formData — harus berisi field 'ttdImage'
   */
  uploadTtd: (formData) =>
    api.postFormData('/ttd/upload-ttd', formData),
};

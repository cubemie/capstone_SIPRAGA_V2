// Centralised service layer — maps 1-to-1 with backend endpoints

import api from '../utils/api';

/* ─────────────────────────────────────────
   AUTH  — /api/auth & /api/superadmin/login
───────────────────────────────────────── */
export const authService = {
  // POST /api/auth/register
  registerWarga: (data) => api.post('/api/auth/register', data),

  // POST /api/auth/login  (warga via NIK)
  loginWarga: (data) => api.post('/api/auth/login', data),

  // POST /api/auth/login-rtrw
  loginRTRW: (data) => api.post('/api/auth/login-rtrw', data),

  // POST /api/superadmin/login
  loginSuperadmin: (data) => api.post('/api/superadmin/login', data),

  // GET /api/auth/check-session
  checkSession: () => api.get('/api/auth/check-session'),
};

/* ─────────────────────────────────────────
   WARGA  — /api/warga
───────────────────────────────────────── */
export const wargaService = {
  // GET /api/warga/profil
  getProfil: () => api.get('/api/warga/profil'),

  // GET /api/warga/kelengkapan-data
  checkKelengkapan: () => api.get('/api/warga/kelengkapan-data'),

  // PUT /api/warga/lengkapi-data  (multipart)
  lengkapiData: (formData) => api.putForm('/api/warga/lengkapi-data', formData),
};

/* ─────────────────────────────────────────
   SURAT  — /api/surat
───────────────────────────────────────── */
export const suratService = {
  // POST /api/surat/ajukan  (warga, multipart)
  ajukanSurat: (formData) => api.postForm('/api/surat/ajukan', formData),

  // POST /api/surat/offline  (RT/RW offline submission, multipart)
  ajukanOffline: (formData) => api.postForm('/api/surat/offline', formData),

  // GET /api/surat/milik-saya
  getSuratSaya: () => api.get('/api/surat/milik-saya'),

  // GET /api/surat/statistik
  getStatistik: () => api.get('/api/surat/statistik'),

  // GET /api/surat/masuk  (RT/RW)
  getSuratMasuk: () => api.get('/api/surat/masuk'),

  // GET /api/surat/menunggu-ttd  (RT/RW)
  getMenungguTTD: () => api.get('/api/surat/menunggu-ttd'),

  // POST /api/surat/tanda-tangani/:id  (multipart)
  tandaTangani: (id, formData) => api.postForm(`/api/surat/tanda-tangani/${id}`, formData),

  // POST /api/surat/tolak/:id
  tolakSurat: (id, alasan) => api.post(`/api/surat/tolak/${id}`, { alasan_penolakan: alasan }),

  // GET /api/surat/riwayat-rtrw
  getRiwayatRTRW: () => api.get('/api/surat/riwayat-rtrw'),

  // GET /api/surat/download/:filename
  getDownloadUrl: (filename) => `/api/surat/download/${filename}`,
};

/* ─────────────────────────────────────────
   TTD  — /api/ttd
───────────────────────────────────────── */
export const ttdService = {
  // POST /api/ttd/upload-ttd  (multipart)
  uploadTTD: (formData) => api.postForm('/api/ttd/upload-ttd', formData),

  // GET /api/ttd/current-ttd
  getCurrentTTD: () => api.get('/api/ttd/current-ttd'),
};

/* ─────────────────────────────────────────
   TEMPLATE SURAT  — /api/template-surat
───────────────────────────────────────── */
export const templateService = {
  // GET /api/template-surat  (public)
  getAll: () => api.get('/api/template-surat'),

  // POST /api/template-surat  (superadmin, multipart)
  upload: (formData) => api.postForm('/api/template-surat', formData),

  // DELETE /api/template-surat/:id
  hapus: (id) => api.delete(`/api/template-surat/${id}`),

  // GET /api/template-surat/:id/download
  getDownloadUrl: (id) => `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/template-surat/${id}/download`,
};

/* ─────────────────────────────────────────
   SUPERADMIN  — /api/superadmin
───────────────────────────────────────── */
export const superadminService = {
  // POST /api/superadmin/rt
  buatRT: (data) => api.post('/api/superadmin/rt', data),

  // POST /api/superadmin/rw
  buatRW: (data) => api.post('/api/superadmin/rw', data),
};

/* ─────────────────────────────────────────
   DASHBOARD RT/RW  — /api/dashboard-rt-rw
───────────────────────────────────────── */
export const dashboardService = {
  // GET /api/dashboard-rt-rw
  getDashboardRTRW: () => api.get('/api/dashboard-rt-rw'),
};

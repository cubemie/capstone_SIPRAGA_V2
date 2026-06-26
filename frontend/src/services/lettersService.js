/**
 * lettersService.js
 *
 * Service terpusat untuk semua API call sistem surat V2.
 * Menggantikan suratService.js (V1) yang sudah di-retire.
 *
 * Semua endpoint merujuk ke /api/v2/letters/*
 */

import { api } from '../utils/api';

export const lettersService = {
  // ── Warga ──────────────────────────────────────────────────────────────────

  /** GET /api/v2/letters — surat milik warga yang sedang login */
  getMyLetters: async () => {
    const res = await api.get('/v2/letters');
    return res.data?.data || [];
  },

  /** POST /api/v2/letters/drafts — simpan draft */
  createDraft: (payload) => api.post('/v2/letters/drafts', payload),

  /** POST /api/v2/letters/:uuid/submit — submit surat */
  submitLetter: (uuid) => api.post(`/v2/letters/${uuid}/submit`),

  /** POST /api/v2/letters/:uuid/attachments — upload lampiran */
  uploadAttachments: (uuid, formData) =>
    api.postFormData(`/v2/letters/${uuid}/attachments`, formData),

  // ── RT/RW ──────────────────────────────────────────────────────────────────

  /** GET /api/v2/letters/inbox — semua surat masuk untuk RT/RW */
  getInbox: async () => {
    const res = await api.get('/v2/letters/inbox');
    return res.data?.data || [];
  },

  /** POST /api/v2/letters/:uuid/approve — setujui surat */
  approveLetter: (uuid, payload = {}) =>
    api.post(`/v2/letters/${uuid}/approve`, payload),

  /** POST /api/v2/letters/:uuid/reject — tolak surat */
  rejectLetter: (uuid, payload = {}) =>
    api.post(`/v2/letters/${uuid}/reject`, payload),

  // ── Shared ─────────────────────────────────────────────────────────────────

  /** GET /api/v2/letters/:uuid — detail surat */
  getLetterDetail: async (uuid) => {
    const res = await api.get(`/v2/letters/${uuid}`);
    if (res.error) throw new Error(res.error);
    return res.data?.data;
  },

  /** GET /api/v2/letters/types — daftar jenis surat */
  getLetterTypes: async () => {
    const res = await api.get('/v2/letters/types');
    return res.data?.data || [];
  },

  /** GET /api/v2/letters/workflows — daftar opsi workflow */
  getWorkflowOptions: async () => {
    const res = await api.get('/v2/letters/workflows');
    return res.data?.data || [];
  },
};

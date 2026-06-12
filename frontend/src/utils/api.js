/**
 * HTTP Client terpusat untuk semua request ke backend.
 *
 * Fitur:
 * - Auto-inject Authorization: Bearer <token> dari localStorage
 * - Kembalikan { data, error } agar mudah di-handle di service/komponen
 * - Support JSON dan FormData (untuk upload file)
 */

const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    // Jangan set Content-Type jika FormData — browser akan set otomatis dengan boundary
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: data.message || 'Terjadi kesalahan.' };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'Tidak dapat terhubung ke server.' };
  }
}

export const api = {
  get: (endpoint) =>
    request(endpoint, { method: 'GET' }),

  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: (endpoint, body) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: (endpoint, body) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (endpoint) =>
    request(endpoint, { method: 'DELETE' }),

  /** Khusus untuk upload file (FormData) */
  postFormData: (endpoint, formData) =>
    request(endpoint, { method: 'POST', body: formData }),

  /** Khusus untuk update file (FormData) via PUT */
  putFormData: (endpoint, formData) =>
    request(endpoint, { method: 'PUT', body: formData }),
  put: async (path, body) => { /* same pattern as post */ },
  patch: async (path, body) => { /* same pattern as post */ },

};

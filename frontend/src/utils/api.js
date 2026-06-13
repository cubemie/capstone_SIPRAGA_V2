/**
 * HTTP Client terpusat untuk semua request ke backend.
 */

const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
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

  postFormData: (endpoint, formData) =>
    request(endpoint, { method: 'POST', body: formData }),

  putFormData: (endpoint, formData) =>
    request(endpoint, { method: 'PUT', body: formData }),
};

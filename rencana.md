# SIPRAGA V2 — Rencana Perbaikan Alur Frontend ↔ Backend
> Berdasarkan analisis kode aktual di repository `capstone_SIPRAGA_V2-be_nella_fix`  
> Terakhir diperbarui: Juni 2026

---

## Ringkasan Bug yang Ditemukan

| # | File | Bug | Dampak |
|---|---|---|---|
| 1 | `frontend/src/utils/api.js` | `put` dan `patch` didefinisikan dua kali — yang kedua adalah stub kosong, menimpa yang pertama | Semua `api.put()` dan `api.patch()` tidak berfungsi |
| 2 | `frontend/src/features/letters/pages/LetterListPage.jsx` | Link card ke `/letters/${uuid}` — route ini tidak ada di App.jsx | Klik surat → 404 |
| 3 | `frontend/src/features/letters/pages/LetterListPage.jsx` | Tombol "Ajukan Surat" link ke `/letters/new` — route ini tidak ada | Tombol tidak berfungsi |
| 4 | `frontend/src/features/letters/pages/LetterInboxPage.jsx` | Link card ke `/letters/${uuid}` — tidak ada di App.jsx | Klik inbox → 404 |
| 5 | `backend/src/modules/letters/letters.routes.js` | Route `POST /:uuid/approve` dan `POST /:uuid/reject` hanya pakai `verifyToken` (warga) — tidak pakai `authRtRwMiddleware` | Warga bisa approve surat sendiri; role-check tidak jalan |
| 6 | `backend/src/modules/letters/sub-modules/approvals/approvals.service.js` | Ketika surat selesai (`completed`), `letter_number` dan `qr_token` tidak di-generate | Surat selesai tanpa nomor resmi dan QR code tidak valid |
| 7 | `backend/src/modules/letters/letters.model.js` | `getInboxByRole` untuk role `rw` tidak filter `tenant_id` — semua surat `approved_rt` dari semua RT masuk | RW bisa lihat surat RT lain |
| 8 | `backend/src/config/queue.js` | Jika Redis tidak aktif, server crash saat boot | Error fatal di environment tanpa Redis |
| 9 | `frontend/src/features/letters/pages/LetterDetailPage.jsx` | TTD query ke `/ttd/current-ttd` tapi route backend adalah `/ttd/current-ttd` yang belum diwrap dengan `/api` path — perlu verifikasi | TTD tidak muncul di panel approval RT/RW |
| 10 | `backend/src/modules/letters/letters.controller.js` | `approveLetter` menggunakan `req.user?.role` tapi route tidak pakai `authRtRwMiddleware`, jadi role bisa dari token warga | Approval logic tidak aman |

---

## PERBAIKAN 1 — `frontend/src/utils/api.js`

**Bug:** `put` dan `patch` didefinisikan dua kali. Definisi kedua adalah stub kosong yang menimpa definisi yang benar.

**Path file:** `frontend/src/utils/api.js`

**Ganti seluruh isi file dengan:**

```js
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
```

---

## PERBAIKAN 2 — `frontend/src/features/letters/pages/LetterListPage.jsx`

**Bug 1:** Link card ke `/letters/${uuid}` — route tidak ada.  
**Bug 2:** Tombol "Ajukan Surat" ke `/letters/new` — route tidak ada.  
**Fix:** Pakai context role dari `useAuth()` agar link dinamis sesuai role.

**Path file:** `frontend/src/features/letters/pages/LetterListPage.jsx`

**Ganti seluruh isi file dengan:**

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getLettersV2 } from '../../../services/suratService';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'process', label: 'Proses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'rejected', label: 'Ditolak' },
];

const PROCESS_STATUSES = ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw', 'approved_rw'];

export default function LetterListPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  // Tentukan prefix path berdasarkan role
  const pathPrefix = user?.role === 'warga' ? '/warga' : '/rtrw';
  const newLetterPath = user?.role === 'warga' ? '/warga/buat-surat-v2' : '/rtrw/buat-surat-v2';

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters-v2'],
    queryFn: getLettersV2,
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'process') return PROCESS_STATUSES.includes(l.status);
    if (activeTab === 'completed') return l.status === 'completed';
    if (activeTab === 'rejected') return ['rejected', 'cancelled'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Surat Saya</h1>
        <Link
          to={newLetterPath}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Ajukan Surat
        </Link>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-lg">Belum ada surat</p>
          <p className="text-sm mt-1">Klik "+ Ajukan Surat" untuk mulai</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((letter) => {
          const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
            label: letter.status,
            color: 'bg-gray-100 text-gray-600',
          };
          return (
            <Link
              key={letter.uuid}
              to={`${pathPrefix}/surat/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {letter.letter_type_name ?? letter.subject ?? 'Surat'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

---

## PERBAIKAN 3 — `frontend/src/features/letters/pages/LetterInboxPage.jsx`

**Bug:** Link card ke `/letters/${uuid}` — route tidak ada di App.jsx untuk RT/RW.  
**Fix:** Link ke `/rtrw/surat/${uuid}`.

**Path file:** `frontend/src/features/letters/pages/LetterInboxPage.jsx`

**Ganti seluruh isi file dengan:**

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { api } from '../../../utils/api';

const fetchInbox = async () => {
  const res = await api.get('/v2/letters/inbox');
  if (res.error) throw new Error(res.error);
  return res.data?.data || [];
};

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'process', label: 'Diproses' },
];

export default function LetterInboxPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: letters = [], isLoading, error } = useQuery({
    queryKey: ['inbox-rtrw'],
    queryFn: fetchInbox,
    refetchInterval: 30000,
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return ['submitted', 'in_review_rt', 'approved_rt'].includes(l.status);
    if (activeTab === 'process') return ['in_review_rt', 'in_review_rw'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inbox Surat Masuk</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Gagal memuat inbox: {error.message}
        </div>
      )}

      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
            {tab.key === 'all' && letters.length > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {letters.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-3xl mb-2">📭</p>
          <p className="font-medium">Tidak ada surat masuk</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((letter) => {
          const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
            label: letter.status,
            color: 'bg-gray-100 text-gray-600',
          };
          return (
            <Link
              key={letter.uuid}
              to={`/rtrw/surat/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{letter.resident_name}</p>
                  <p className="text-sm text-gray-500">{letter.letter_type_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Proses →</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

---

## PERBAIKAN 4 — `backend/src/modules/letters/letters.routes.js`

**Bug:** Route `approve` dan `reject` tidak pakai `authRtRwMiddleware`, sehingga:
- Tidak ada pengecekan role RT/RW
- `req.tenantId` tidak di-set
- Warga bisa approve surat sendiri

**Path file:** `backend/src/modules/letters/letters.routes.js`

**Ganti seluruh isi file dengan:**

```js
const express = require('express');
const LettersController = require('./letters.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');
const authRtRwMiddleware = require('../../middlewares/authRtRwMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Public routes (tanpa auth) ─────────────────────────────────────────────
router.get('/types', LettersController.getLetterTypes);
router.get('/types/:typeId/fields', LettersController.getTemplateFields);
router.get('/workflows', LettersController.getWorkflowOptions);
router.get('/verify/:qrToken', LettersController.verifyByQrToken);

// ── RT/RW only routes ──────────────────────────────────────────────────────
router.get('/inbox', authRtRwMiddleware, LettersController.getInbox);
router.post('/:uuid/approve', authRtRwMiddleware, LettersController.approveLetter);
router.post('/:uuid/reject', authRtRwMiddleware, LettersController.rejectLetter);

// ── Warga routes (JWT warga) ───────────────────────────────────────────────
router.use(verifyToken);
router.get('/', LettersController.getMyLetters);
router.post('/drafts', LettersController.createDraft);
router.get('/:uuid', LettersController.getLetterDetail);
router.post('/:uuid/submit', LettersController.submitLetter);
router.get('/:uuid/preview-pdf', LettersController.getPreviewPdf);
router.post('/:uuid/upload-pdf', upload.single('pdf'), LettersController.uploadPdfClient);
router.post('/:uuid/attachments', upload.array('attachments', 10), LettersController.uploadAttachments);

module.exports = router;
```

> ⚠️ **Catatan penting:** Route `/:uuid` (GET detail) perlu bisa diakses oleh warga DAN RT/RW. Karena pakai `router.use(verifyToken)` di atas, RT/RW yang tokennya juga valid JWT bisa akses endpoint ini. Tapi `approve` dan `reject` sudah dipindah sebelum `router.use(verifyToken)` agar pakai `authRtRwMiddleware`.

---

## PERBAIKAN 5 — `backend/src/modules/letters/sub-modules/approvals/approvals.service.js`

**Bug:** Ketika surat selesai (`completed`), tidak generate `letter_number` dan `qr_token`. Tanpa ini, QR verify tidak bisa dipakai dan surat tidak punya nomor resmi.

**Path file:** `backend/src/modules/letters/sub-modules/approvals/approvals.service.js`

**Ganti seluruh isi file dengan:**

```js
const pool = require('../../../../config/db.js');
const { v4: uuidv4 } = require('uuid');

// Coba load pdfQueue — jika Redis tidak aktif, skip tanpa crash
let pdfQueue = null;
try {
  const queueModule = require('../../../../config/queue.js');
  pdfQueue = queueModule.pdfQueue;
} catch (e) {
  console.warn('[Approvals] BullMQ tidak aktif — PDF generation akan di-skip:', e.message);
}

const STATUS_TRANSITIONS = {
  RT_ONLY: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  RT_THEN_RW: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw: { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

/**
 * Generate nomor surat: 001/RT-06/RW-002/VII/2026
 */
async function generateLetterNumber(letterTypeCode, tenantId) {
  // Hitung surat yang sudah selesai bulan ini sebagai urutan
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) as count FROM letters 
     WHERE status = 'completed' 
     AND MONTH(completed_at) = MONTH(NOW()) 
     AND YEAR(completed_at) = YEAR(NOW())`
  );
  const seq = String(parseInt(count) + 1).padStart(3, '0');
  const monthRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()];
  const year = new Date().getFullYear();
  return `${seq}/${letterTypeCode || 'SK'}/${tenantId || 'RT'}/${monthRoman}/${year}`;
}

const approveLetter = async (letterUuid, role, notes = null, signatureUrl = null, approverId) => {
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code, lt.code AS letter_type_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     JOIN letter_types lt ON l.letter_type_id = lt.id
     WHERE l.uuid = ?`,
    [letterUuid]
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error(`Workflow tidak dikenal: ${letter.workflow_code}`);

  // Normalisasi role: admin_rt → rt, admin_rw → rw
  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const transition = workflow[normalizedRole];
  if (!transition) {
    throw new Error(`Role "${normalizedRole}" tidak bisa approve di workflow "${letter.workflow_code}"`);
  }
  if (!transition.from.includes(letter.status)) {
    throw new Error(
      `Status saat ini "${letter.status}" tidak bisa di-approve. Harus salah satu dari: ${transition.from.join(', ')}`
    );
  }

  const nextStatus = transition.to;
  const isCompleted = nextStatus === 'completed';

  // Generate letter_number dan qr_token hanya saat completed
  let letterNumber = null;
  let qrToken = null;
  if (isCompleted) {
    letterNumber = await generateLetterNumber(letter.letter_type_code, letter.tenant_id);
    qrToken = uuidv4();
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert approval record
    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
       VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes, signatureUrl]
    );

    // Update status surat
    if (isCompleted) {
      await conn.query(
        `UPDATE letters 
         SET status = ?, current_step = current_step + 1,
             completed_at = NOW(), letter_number = ?, qr_token = ?
         WHERE id = ?`,
        [nextStatus, letterNumber, qrToken, letter.id]
      );
    } else {
      await conn.query(
        `UPDATE letters SET status = ?, current_step = current_step + 1 WHERE id = ?`,
        [nextStatus, letter.id]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  // Trigger PDF generation jika selesai (non-blocking)
  if (isCompleted && pdfQueue) {
    pdfQueue.add('generate-pdf', { letterId: letter.id, type: 'final' }).catch(err => {
      console.error('[Approvals] Gagal enqueue PDF job:', err.message);
    });
  }

  return { nextStatus, letterNumber, qrToken };
};

const rejectLetter = async (letterUuid, role, notes, approverId) => {
  const [[letter]] = await pool.query('SELECT * FROM letters WHERE uuid = ?', [letterUuid]);
  if (!letter) throw new Error('Surat tidak ditemukan');

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
       VALUES (?, ?, ?, 'rejected', ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes]
    );

    await conn.query(
      `UPDATE letters SET status = 'rejected', rejected_by_role = ? WHERE id = ?`,
      [normalizedRole, letter.id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = { approveLetter, rejectLetter };
```

---

## PERBAIKAN 6 — `backend/src/modules/letters/letters.model.js` — `getInboxByRole`

**Bug:** Untuk role `rw`, tidak ada filter `tenant_id`, sehingga semua surat `approved_rt` dari seluruh RT masuk ke inbox semua RW.

**Lokasi:** Method `getInboxByRole` di `backend/src/modules/letters/letters.model.js`

**Cari method ini dan ganti dengan:**

```js
async getInboxByRole(role, tenantId) {
  let whereClause;
  let params;

  if (role === 'rt') {
    // RT hanya lihat surat dalam tenant (rw_id) yang sama
    whereClause = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
    params = [tenantId];
  } else if (role === 'rw') {
    // RW lihat surat yang sudah approved RT, dalam tenant yang sama
    whereClause = `l.status IN ('approved_rt', 'in_review_rw') AND l.tenant_id = ?`;
    params = [tenantId];
  } else {
    return [];
  }

  const [rows] = await db.query(
    `SELECT l.uuid, l.status, l.created_at, l.subject,
            lt.name AS letter_type_name,
            w.nama AS resident_name
     FROM letters l
     JOIN letter_types lt ON l.letter_type_id = lt.id
     JOIN warga w ON l.resident_id = w.id_warga
     WHERE ${whereClause}
     ORDER BY l.created_at DESC`,
    params
  );
  return rows;
},
```

---

## PERBAIKAN 7 — `backend/src/config/queue.js`

**Bug:** Jika Redis tidak aktif, `new IORedis()` crash saat boot dan server tidak bisa jalan sama sekali.

**Path file:** `backend/src/config/queue.js`

**Ganti seluruh isi file dengan:**

```js
let pdfQueue = null;
let connection = null;

try {
  const { Queue } = require('bullmq');
  const IORedis = require('ioredis');

  connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    lazyConnect: true,          // jangan konek saat inisialisasi
    connectTimeout: 5000,
    retryStrategy: (times) => {
      if (times >= 3) {
        console.warn('[Redis] Gagal konek setelah 3 percobaan — queue dinonaktifkan');
        return null; // stop retry
      }
      return Math.min(times * 500, 2000);
    },
  });

  connection.on('error', (err) => {
    console.warn('[Redis] Connection error (queue dinonaktifkan):', err.message);
  });

  connection.on('connect', () => {
    console.log('[Redis] Connected — PDF queue aktif');
  });

  pdfQueue = new Queue('pdf-generation', { connection });
  console.log('[Queue] BullMQ PDF queue initialized');
} catch (err) {
  console.warn('[Queue] BullMQ tidak bisa di-inisialisasi — PDF generation akan sync:', err.message);
}

module.exports = { pdfQueue, connection };
```

---

## PERBAIKAN 8 — `backend/src/modules/letters/letters.controller.js` — `approveLetter` dan `rejectLetter`

**Bug:** Controller menggunakan `req.user?.role || 'admin_rt'` dengan fallback hardcode. Setelah route dipindah ke `authRtRwMiddleware`, ini sudah tidak dibutuhkan. Juga perlu pakai `approverId` yang benar.

**Lokasi:** Method `approveLetter` dan `rejectLetter` di `letters.controller.js`

**Cari kedua method dan ganti dengan:**

```js
static async approveLetter(req, res) {
  try {
    const { uuid } = req.params;
    const { notes, signature_url } = req.body;
    const role = req.user?.role;
    const approverId = req.user?.id;

    if (!role || !approverId) {
      return res.status(401).json({ success: false, message: 'Data user tidak valid' });
    }

    const result = await ApprovalsService.approveLetter(uuid, role, notes, signature_url, approverId);
    res.json({ success: true, data: result, message: 'Surat berhasil disetujui' });
  } catch (error) {
    console.error('Error approveLetter:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal menyetujui surat' });
  }
}

static async rejectLetter(req, res) {
  try {
    const { uuid } = req.params;
    const { notes, reason } = req.body;
    const role = req.user?.role;
    const approverId = req.user?.id;

    if (!role || !approverId) {
      return res.status(401).json({ success: false, message: 'Data user tidak valid' });
    }

    await ApprovalsService.rejectLetter(uuid, role, notes || reason, approverId);
    res.json({ success: true, message: 'Surat berhasil ditolak' });
  } catch (error) {
    console.error('Error rejectLetter:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal menolak surat' });
  }
}
```

---

## PERBAIKAN 9 — Route Warga Bisa Akses Detail Surat Milik RT/RW View

Di `App.jsx`, route `/rtrw/surat/:uuid` dan `/warga/surat/:uuid` keduanya sudah ada dan keduanya pakai komponen `LetterDetailPage`. Tidak perlu perubahan di App.jsx.

Namun perlu dicek: `LetterDetailPage` memanggil `api.get('/v2/letters/${uuid}')` yang terlindungi `verifyToken`. RT/RW juga punya JWT yang valid, jadi ini seharusnya jalan.

Yang perlu dipastikan adalah **route `/letters/inbox`** di backend sudah pakai `authRtRwMiddleware` (sudah diperbaiki di Perbaikan 4).

---

## PERBAIKAN 10 — `backend/src/modules/letters/letters.controller.js` — Method `getLetterDetail` untuk RT/RW

**Bug tambahan:** `getLetterDetail` hanya bisa diakses oleh warga (karena pakai `router.use(verifyToken)`). Tapi RT/RW juga perlu lihat detail surat yang mereka proses. Saat ini hal ini tidak terlindungi dengan benar.

**Solusi:** Modifikasi `getLetterDetail` agar mengizinkan warga pemilik surat DAN RT/RW yang bertugas.

**Lokasi:** Method `getLetterDetail` di `letters.controller.js`

**Ganti method dengan:**

```js
static async getLetterDetail(req, res) {
  try {
    const { uuid } = req.params;
    const detail = await LettersService.getLetterDetail(uuid);

    // Cek akses: warga hanya bisa lihat suratnya sendiri
    if (req.user?.role === 'warga') {
      const residentId = req.user?.id_warga;
      if (detail.resident_id !== residentId) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }
    }
    // RT/RW bisa lihat semua (sudah difilter di inbox) — tidak perlu cek tambahan

    res.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error getLetterDetail:', error);
    res.status(404).json({ success: false, message: error.message || 'Surat tidak ditemukan' });
  }
}
```

Agar RT/RW bisa akses `/v2/letters/:uuid`, route GET `/:uuid` perlu bisa terima KEDUA jenis token. Tambahkan middleware custom di `letters.routes.js` setelah perbaikan:

```js
// Middleware yang accept warga DAN RT/RW
const flexibleAuth = (req, res, next) => {
  const { verifyToken: vt } = require('../../middlewares/authMiddleware');
  const rtRwMw = require('../../middlewares/authRtRwMiddleware');

  // Coba verifyToken dulu (warga), jika role bukan warga coba rtRwMiddleware
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const jwt = require('jsonwebtoken');
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.tenantId = decoded.rw_id || decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};
```

Lalu ubah route detail di letters.routes.js menjadi:

```js
// Gunakan flexibleAuth agar warga DAN RT/RW bisa lihat detail
router.get('/:uuid', flexibleAuth, LettersController.getLetterDetail);
```

**Versi lengkap `letters.routes.js` yang menggabungkan semua perbaikan:**

```js
const express = require('express');
const LettersController = require('./letters.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');
const authRtRwMiddleware = require('../../middlewares/authRtRwMiddleware');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Middleware fleksibel: accept warga, RT, dan RW ────────────────────────
const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.tenantId = decoded.rw_id || decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

// ── Public routes (tanpa auth) ─────────────────────────────────────────────
router.get('/types', LettersController.getLetterTypes);
router.get('/types/:typeId/fields', LettersController.getTemplateFields);
router.get('/workflows', LettersController.getWorkflowOptions);
router.get('/verify/:qrToken', LettersController.verifyByQrToken);

// ── RT/RW only routes ──────────────────────────────────────────────────────
router.get('/inbox', authRtRwMiddleware, LettersController.getInbox);
router.post('/:uuid/approve', authRtRwMiddleware, LettersController.approveLetter);
router.post('/:uuid/reject', authRtRwMiddleware, LettersController.rejectLetter);

// ── Warga only routes ──────────────────────────────────────────────────────
router.post('/drafts', verifyToken, LettersController.createDraft);
router.post('/:uuid/submit', verifyToken, LettersController.submitLetter);
router.post('/:uuid/upload-pdf', verifyToken, upload.single('pdf'), LettersController.uploadPdfClient);
router.post('/:uuid/attachments', verifyToken, upload.array('attachments', 10), LettersController.uploadAttachments);

// ── Shared routes (warga + RT/RW) ──────────────────────────────────────────
router.get('/', verifyToken, LettersController.getMyLetters);
router.get('/:uuid', flexibleAuth, LettersController.getLetterDetail);
router.get('/:uuid/preview-pdf', flexibleAuth, LettersController.getPreviewPdf);

module.exports = router;
```

---

## PERBAIKAN 11 — `frontend/src/features/letters/pages/LetterDetailPage.jsx` — Perbaiki redirect "Kembali"

**Bug:** Setelah approve/reject, user perlu kembali ke inbox yang benar sesuai rolenya.  
**Tambahkan** tombol back yang role-aware di bagian atas `LetterDetailPage`:

Cari baris pembuka `return (` di dalam `LetterDetailPage` dan tambahkan sebelum `<div className="max-w-3xl...">`:

```jsx
// Tambah import ini di atas file:
import { useNavigate } from 'react-router-dom';

// Tambah di dalam komponen sebelum return:
const navigate = useNavigate();
const backPath = user?.role === 'warga' ? '/warga/riwayat' : '/rtrw/inbox';
const backLabel = user?.role === 'warga' ? '← Riwayat Surat' : '← Kotak Masuk';
```

Lalu di dalam JSX, tambahkan tombol kembali di atas header:

```jsx
<button
  onClick={() => navigate(backPath)}
  className="mb-4 text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
>
  {backLabel}
</button>
```

---

## PERBAIKAN 12 — `frontend/src/pages/rtrw/Dashboard.jsx` — Sambungkan ke V2 Inbox

**Bug:** Dashboard RT/RW saat ini pakai `useSurat('masuk')` yang memanggil V1 endpoint `/api/surat/masuk`. RT/RW yang menggunakan sistem V2 tidak akan melihat surat baru yang masuk lewat wizard.

**Tambahkan** section "Surat V2 Masuk" di `rtrw/Dashboard.jsx`. Cari bagian `export default function RtRwDashboard()` dan tambahkan query V2 di dalam komponen:

```jsx
// Tambah import di atas:
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { Link } from 'react-router-dom';

// Tambah di dalam komponen (setelah existing state):
const { data: v2Inbox = [] } = useQuery({
  queryKey: ['inbox-rtrw'],
  queryFn: async () => {
    const res = await api.get('/v2/letters/inbox');
    return res.data?.data || [];
  },
  refetchInterval: 30000,
});

const v2Pending = v2Inbox.filter(l => ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw'].includes(l.status));
```

Lalu tambahkan JSX section baru (sebelum closing `</div>` utama):

```jsx
{/* Section V2 */}
{v2Pending.length > 0 && (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-slate-800">📬 Surat Masuk V2 ({v2Pending.length})</h3>
      <Link to="/rtrw/inbox" className="text-xs text-blue-600 hover:underline">Lihat semua →</Link>
    </div>
    <div className="space-y-2">
      {v2Pending.slice(0, 3).map(letter => (
        <Link
          key={letter.uuid}
          to={`/rtrw/surat/${letter.uuid}`}
          className="block p-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-800">{letter.resident_name}</p>
              <p className="text-xs text-slate-500">{letter.letter_type_name}</p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {letter.status === 'submitted' ? 'Menunggu' : 'Diproses'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
```

---

## PERBAIKAN 13 — `frontend/src/pages/warga/Dashboard.jsx` — Link ke Detail Surat Benar

**Bug:** Jika ada link di Dashboard warga ke detail surat, perlu mengarah ke `/warga/surat/${uuid}`.

Cari bagian yang render daftar `recentSurat` dan pastikan link-nya:

```jsx
// SALAH (jika ada):
to={`/letters/${s.uuid}`}

// BENAR:
to={`/warga/surat/${s.uuid}`}
```

---

## Ringkasan Semua File yang Harus Diubah

| # | File Path | Jenis Perubahan |
|---|---|---|
| 1 | `frontend/src/utils/api.js` | Hapus duplikasi `put` dan `patch` |
| 2 | `frontend/src/features/letters/pages/LetterListPage.jsx` | Fix link card & tombol ajukan |
| 3 | `frontend/src/features/letters/pages/LetterInboxPage.jsx` | Fix link card ke `/rtrw/surat/` |
| 4 | `backend/src/modules/letters/letters.routes.js` | Pindah approve/reject ke `authRtRwMiddleware`; tambah `flexibleAuth` |
| 5 | `backend/src/modules/letters/sub-modules/approvals/approvals.service.js` | Generate `letter_number` & `qr_token` saat completed; graceful Redis |
| 6 | `backend/src/modules/letters/letters.model.js` | Fix `getInboxByRole` untuk RW + filter tenant |
| 7 | `backend/src/config/queue.js` | Graceful degradation jika Redis tidak aktif |
| 8 | `backend/src/modules/letters/letters.controller.js` | Fix `approveLetter`, `rejectLetter`, `getLetterDetail` |
| 9 | `frontend/src/features/letters/pages/LetterDetailPage.jsx` | Tambah tombol back role-aware |
| 10 | `frontend/src/pages/rtrw/Dashboard.jsx` | Tambah section V2 inbox |
| 11 | `frontend/src/pages/warga/Dashboard.jsx` | Fix link detail surat |

---

## Alur yang Seharusnya Berjalan Setelah Perbaikan

### Warga — Ajukan Surat

```
1. Login → /login-warga
   AuthService.loginWarga → JWT { id_warga, nama, role: 'warga' }

2. Dashboard → /warga/dashboard
   Tampil summary surat V2 dari GET /api/v2/letters

3. Klik "Ajukan Surat Baru" → /warga/buat-surat-v2
   LetterWizardPage
   ├── Step 1: GET /api/v2/letters/types
   ├── Step 2: GET /api/v2/letters/types/:typeId/fields
   ├── Step 3: Content builder (state only, tidak ada API call)
   ├── Step 4: File dipilih tapi BELUM diupload (state)
   ├── Step 5: GET /api/v2/letters/workflows
   └── Klik "Kirim Pengajuan":
       a. POST /api/v2/letters/drafts → { uuid }
          Payload: { letter_type_id, workflow_option_id, subject, purpose, fields[] }
          Response: { uuid: "xxx-xxx-xxx" }
       b. POST /api/v2/letters/:uuid/attachments (jika ada lampiran)
          FormData: files[]
       c. POST /api/v2/letters/:uuid/submit
          → Update status: 'draft' → 'in_review_rt'
          → Notifikasi ke RT/RW (jika NotificationService aktif)
   → Step8Success tampil dengan UUID surat

4. Status surat → /warga/riwayat
   GET /api/v2/letters → daftar semua surat warga
   Link tiap surat → /warga/surat/:uuid

5. Detail surat → /warga/surat/:uuid
   GET /api/v2/letters/:uuid
   Tampil:
   - Status tracker visual
   - Data field surat
   - Timeline approval (riwayat proses)
   - Live PDF preview (react-pdf dari LetterPdfTemplate)
   - Tombol "Download PDF"
```

### RT — Proses Surat

```
1. Login → /login-rtrw
   AuthService.loginRtRw → JWT { id: rt_id, rw_id, role: 'rt' }
   req.tenantId = rw_id (dari authRtRwMiddleware)

2. Dashboard → /rtrw/dashboard
   Tampil surat V2 masuk dari GET /api/v2/letters/inbox
   (filter: status IN ('submitted','in_review_rt') AND tenant_id = rw_id)

3. Inbox → /rtrw/inbox
   GET /api/v2/letters/inbox → LetterInboxPage
   Link tiap surat → /rtrw/surat/:uuid ✓

4. Detail surat → /rtrw/surat/:uuid
   GET /api/v2/letters/:uuid (via flexibleAuth)
   Tampil:
   - Info surat + status
   - Panel TtdApprovalPanel (jika role rt DAN status submitted/in_review_rt)
   - Live PDF preview

5. Setujui → POST /api/v2/letters/:uuid/approve (authRtRwMiddleware)
   ApprovalsService.approveLetter:
   - Cek workflow (RT_ONLY → completed, RT_THEN_RW → approved_rt)
   - Insert letter_approvals
   - Update letters.status
   - Jika completed: generate letter_number + qr_token
   - Enqueue PDF final generation (jika Redis aktif)

6. Tolak → POST /api/v2/letters/:uuid/reject (authRtRwMiddleware)
   - Insert letter_approvals (action='rejected')
   - Update letters.status = 'rejected'
```

### RW — Proses Surat (Workflow RT_THEN_RW)

```
1. Login → /login-rtrw
   JWT { id: rw_id, rw_id, role: 'rw' }

2. Inbox → /rtrw/inbox
   GET /api/v2/letters/inbox
   (filter: status IN ('approved_rt','in_review_rw') AND tenant_id = rw_id)

3. Detail + Approve/Reject
   Sama dengan RT di atas, tapi:
   - Panel TtdApprovalPanel tampil jika role=rw DAN status approved_rt/in_review_rw
   - Setelah approve → status = 'completed'
   - letter_number dan qr_token di-generate di sini
```

### Warga — Download Surat Selesai

```
1. Setelah status = 'completed':
   - letter_number sudah ada di DB
   - qr_token sudah ada di DB
   - PDF final sudah di-generate (via BullMQ jika Redis aktif,
     atau perlu di-trigger manual via GET /:uuid/preview-pdf)

2. /warga/surat/:uuid
   - LetterDetailPage render PDF via LetterPdfTemplate (react-pdf)
   - PDFDownloadLink sudah ada → tombol "Download PDF"
   - PDF sudah berisi: nomor surat, QR code, TTD (dari signatures[] di previewData)

3. QR Verify
   Scan QR code → /verify/:qrToken (publik)
   GET /api/v2/letters/verify/:qrToken
   Tampil: nama warga, jenis surat, nomor surat, status, tanggal selesai
```

---

## Catatan Penting

### Tenant ID untuk Warga Baru
Saat warga submit surat, `tenant_id` di `letters.controller.js` diisi dengan:
```js
tenant_id: req.tenantId || req.user?.rw_id || 1, // Fallback 1
```
Ini berarti surat warga akan masuk ke RW dengan `rw_id = 1` secara default. Untuk mencocokkan dengan tenant RT, ada dua opsi:

**Opsi A (cepat):** Isi `tenant_id` dari data warga itu sendiri (field `rw` di tabel `warga`):
```js
// Di createDraft di letters.controller.js, tambah query:
const [wargaRow] = await pool.query('SELECT rw FROM warga WHERE id_warga = ?', [residentId]);
const tenantId = wargaRow[0]?.rw || req.user?.rw_id || 'RW001';
```

**Opsi B (proper):** Saat warga register, simpan `rw_id` yang valid. Saat ajukan surat, ambil dari profil warga.

Untuk sekarang, **Opsi A** paling cepat diimplementasikan.

---

### Jika Redis Tidak Aktif (Mode Dev Tanpa Docker)
PDF akan tetap bisa di-generate on-demand via endpoint:
```
GET /api/v2/letters/:uuid/preview-pdf
```
Endpoint ini memanggil `PdfService.createPdfForLetter(uuid)` langsung (synchronous) tanpa queue. `LetterPdfTemplate` (react-pdf) di frontend juga sudah bisa render PDF di browser tanpa butuh backend PDF.

---

### Urutan Deploy / Testing (Docker)
1. Salin env: `cp backend/.env.example backend/.env`
2. Jalankan stack: `docker compose up --build -d` (atau `docker compose -f docker-compose.dev.yml up --build`)
3. Jalankan frontend: `cd frontend && npm run dev`
4. Register warga → Login → Ajukan surat → Submit
5. Login RT (username: `ketuart001`, password: `admin123`)
6. Inbox → Proses → Setujui
7. Login warga → Riwayat → Cek status `completed` → Download PDF

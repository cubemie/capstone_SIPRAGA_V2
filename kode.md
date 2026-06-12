# SIPRAGA V2 — Kode Perbaikan Lengkap
> Semua file yang perlu dibuat/diubah untuk memperbaiki TTD, PDF Preview, dan halaman stub  
> Base: `capstone_SIPRAGA_V2-backup-supabase__2_.zip` (backup terbaru)  
> Terakhir diperbarui: Juni 2026

---

## Ringkasan Bug yang Ditemukan

| File | Status | Bug |
|---|---|---|
| `frontend/.../Step6PdfPreview.jsx` | ❌ Broken | Mock HTML, bukan PDF real dari backend |
| `frontend/.../LetterDetailPage.jsx` | ❌ Stub | Hanya `return <div>Letter Detail</div>` |
| `frontend/.../LetterInboxPage.jsx` | ❌ Stub | Hanya `return <div>Letter Inbox</div>` |
| `frontend/.../QrVerifyPage.jsx` | ❌ Stub | Hanya `return <div>QR Verification</div>` |
| `frontend/.../TtdSurat.jsx` | 🟡 UI bagus, canvas bug | `getCanvas()` deprecated di alpha, perlu fix |
| `frontend/src/services/ttdService.js` | ❌ Broken | `postFormData` ada tapi response handling salah |
| `frontend/src/constants/suratStatus.js` | ⚠️ Incomplete | Hanya V1, missing V2 statuses |
| `backend/.../letters.routes.js` | ❌ Missing | Tidak ada route `/inbox`, `/verify/:qr`, `/:uuid/preview-pdf` |
| `backend/.../letters.controller.js` | ❌ Missing | Tidak ada `getInbox`, `verifyByQrToken`, `getPreviewPdf` |
| `backend/.../letters.model.js` | ❌ Missing | Tidak ada `getDetailByUuid`, `getInboxByRole` |
| `backend/.../authRtRwMiddleware.js` | ❌ Missing | `req.user` dan `req.tenantId` tidak di-set |
| `backend/.../approvals.service.js` | 🟡 Logic OK | Perlu sinkronisasi dengan pool import |

---

## BAGIAN 1 — BACKEND FIXES

---

### 1.1 `backend/src/middlewares/authRtRwMiddleware.js`

**Bug:** `req.user` tidak di-set (cuma `req.rtRwUser`), `req.tenantId` tidak ada. Ini bikin `getInbox` controller crash.

```js
// backend/src/middlewares/authRtRwMiddleware.js
// GANTI SELURUH ISI FILE INI

const { extractAndVerifyToken } = require('./authMiddleware');

const ALLOWED_ROLES = ['rt', 'rw'];

module.exports = (req, res, next) => {
  const result = extractAndVerifyToken(req, res);
  if (!result) return; // response sudah dikirim

  const { decoded } = result;

  if (!ALLOWED_ROLES.includes(decoded.role)) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya RT/RW yang diizinkan.' });
  }

  req.rtRwUser = decoded;
  req.user     = decoded;              // ← TAMBAH: agar controller bisa pakai req.user
  req.tenantId = decoded.rw_id || decoded.id; // ← TAMBAH: untuk filter inbox per tenant
  next();
};
```

---

### 1.2 `backend/src/modules/letters/letters.model.js`

**Bug:** Tidak ada method `getDetailByUuid` (full data + approvals + pdf_versions) dan `getInboxByRole`. 

Tambahkan dua method baru setelah `getMyLetters`:

```js
// backend/src/modules/letters/letters.model.js
// TAMBAH dua method ini di dalam object LettersModel, setelah method getMyLetters

  async getDetailByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name AS letter_type_name,
              w.nama AS resident_name, w.NIK AS resident_nik,
              lwo.name AS workflow_name, lwo.steps AS workflow_steps,
              lwo.code AS workflow_code
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       JOIN warga w ON l.resident_id = w.id_warga
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       WHERE l.uuid = ?`,
      [uuid]
    );
    if (!rows.length) return null;

    const letter = rows[0];

    const [fieldValues] = await db.query(
      'SELECT field_key, value FROM letter_field_values WHERE letter_id = ? ORDER BY id ASC',
      [letter.id]
    );

    const [approvals] = await db.query(
      `SELECT la.*,
              COALESCE(r.nama_ketua, rw_table.nama_ketua) AS approver_name,
              COALESCE(r.no_rt, NULL) AS approver_no_rt
       FROM letter_approvals la
       LEFT JOIN rt r ON la.approver_id = r.rt_id
       LEFT JOIN rw rw_table ON la.approver_id = rw_table.rw_id
       WHERE la.letter_id = ?
       ORDER BY la.acted_at ASC`,
      [letter.id]
    );

    const [pdfVersions] = await db.query(
      `SELECT type, file_url, generated_at
       FROM letter_pdf_versions
       WHERE letter_id = ?
       ORDER BY generated_at DESC`,
      [letter.id]
    );

    return {
      ...letter,
      field_values: fieldValues,
      approvals,
      pdf_versions: pdfVersions,
    };
  },

  async getInboxByRole(role, tenantId) {
    let whereClause;
    let params;

    if (role === 'rt') {
      whereClause = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
      params = [tenantId];
    } else if (role === 'rw') {
      whereClause = `l.status IN ('approved_rt', 'in_review_rw')`;
      params = [];
    } else {
      return [];
    }

    const [rows] = await db.query(
      `SELECT l.uuid, l.status, l.created_at, l.subject, l.purpose,
              lt.name AS letter_type_name,
              w.nama AS resident_name, w.NIK AS resident_nik
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

### 1.3 `backend/src/modules/letters/letters.controller.js`

**Bug:** Tidak ada `getInbox`, `getPreviewPdf`, dan `verifyByQrToken`.

```js
// backend/src/modules/letters/letters.controller.js
// GANTI SELURUH ISI FILE INI

const LettersService  = require('./letters.service');
const ApprovalsService = require('./sub-modules/approvals/approvals.service');
const LettersModel    = require('./letters.model');
const pool            = require('../../config/db');
const PdfService      = require('./sub-modules/pdf/pdf.service');

class LettersController {

  static async getLetterTypes(req, res) {
    try {
      const types = await LettersService.getAvailableLetterTypes();
      res.json({ success: true, data: types });
    } catch (error) {
      console.error('Error getLetterTypes:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async getTemplateFields(req, res) {
    try {
      const { typeId } = req.params;
      const fields = await LettersService.getTemplateFields(typeId);
      res.json({ success: true, data: fields });
    } catch (error) {
      console.error('Error getTemplateFields:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async getWorkflowOptions(req, res) {
    try {
      const options = await LettersService.getWorkflowOptions();
      res.json({ success: true, data: options });
    } catch (error) {
      console.error('Error getWorkflowOptions:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  static async createDraft(req, res) {
    try {
      const { letter_type_id, workflow_option_id, subject, purpose, fields } = req.body;
      const payload = {
        tenant_id: req.tenantId || req.user?.rw_id || null,
        resident_id: req.user.id_warga,
        letter_type_id,
        workflow_option_id,
        subject,
        purpose,
        fields,
      };
      const uuid = await LettersService.createDraft(payload);
      res.status(201).json({ success: true, data: { uuid }, message: 'Draft berhasil disimpan' });
    } catch (error) {
      console.error('Error createDraft:', error);
      res.status(500).json({ success: false, message: 'Gagal menyimpan draft' });
    }
  }

  // ─── INBOX (RT/RW) ────────────────────────────────────────────────────────
  static async getInbox(req, res) {
    try {
      const { role } = req.user;
      const tenantId = req.tenantId;
      const letters = await LettersModel.getInboxByRole(role, tenantId);
      res.json({ success: true, message: 'Inbox berhasil diambil', data: letters });
    } catch (err) {
      console.error('Error getInbox:', err);
      res.status(500).json({ success: false, message: 'Gagal mengambil inbox', error: err.message });
    }
  }

  static async getMyLetters(req, res) {
    try {
      const residentId = req.user.id_warga;
      const letters = await LettersService.getMyLetters(residentId);
      res.json({ success: true, data: letters });
    } catch (error) {
      console.error('Error getMyLetters:', error);
      res.status(500).json({ success: false, message: 'Gagal memuat surat' });
    }
  }

  static async getLetterDetail(req, res) {
    try {
      const { uuid } = req.params;
      // Gunakan getDetailByUuid untuk data lengkap (field_values, approvals, pdf_versions)
      const detail = await LettersModel.getDetailByUuid(uuid);
      if (!detail) {
        return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
      }
      res.json({ success: true, data: detail });
    } catch (error) {
      console.error('Error getLetterDetail:', error);
      res.status(404).json({ success: false, message: error.message || 'Surat tidak ditemukan' });
    }
  }

  static async submitLetter(req, res) {
    try {
      const { uuid } = req.params;
      await LettersService.submitLetter(uuid);
      res.json({ success: true, message: 'Surat berhasil diajukan' });
    } catch (error) {
      console.error('Error submitLetter:', error);
      res.status(400).json({ success: false, message: error.message || 'Gagal mengajukan surat' });
    }
  }

  // ─── PDF PREVIEW ──────────────────────────────────────────────────────────
  static async getPreviewPdf(req, res) {
    try {
      const { uuid } = req.params;

      const [[letterRow]] = await pool.query(
        'SELECT id FROM letters WHERE uuid = ?',
        [uuid]
      );
      if (!letterRow) {
        return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
      }

      const letterId = letterRow.id;

      // Cek apakah preview sudah ada di DB
      const [existing] = await pool.query(
        `SELECT file_url FROM letter_pdf_versions
         WHERE letter_id = ? AND type = 'preview'
         ORDER BY generated_at DESC LIMIT 1`,
        [letterId]
      );

      if (existing.length) {
        return res.json({
          success: true,
          message: 'PDF preview tersedia',
          data: { pdf_url: existing[0].file_url },
        });
      }

      // Generate preview baru
      const pdfBuffer = await PdfService.createPdfForLetter(uuid);
      const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      await pool.query(
        `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
         VALUES (?, 1, 'preview', ?, NOW())`,
        [letterId, base64Pdf]
      );

      return res.json({
        success: true,
        message: 'PDF preview berhasil digenerate',
        data: { pdf_url: base64Pdf },
      });
    } catch (error) {
      console.error('Error getPreviewPdf:', error);
      res.status(500).json({ success: false, message: 'Gagal generate PDF preview', error: error.message });
    }
  }

  // ─── APPROVE / REJECT ─────────────────────────────────────────────────────
  static async approveLetter(req, res) {
    try {
      const { uuid } = req.params;
      const role     = req.user?.role || 'rt';
      const { notes, signature_url } = req.body || {};
      const result   = await ApprovalsService.approveLetter(uuid, role, notes, signature_url);
      res.json({ success: true, data: result, message: 'Surat berhasil disetujui' });
    } catch (error) {
      console.error('Error approveLetter:', error);
      res.status(400).json({ success: false, message: error.message || 'Gagal menyetujui surat' });
    }
  }

  static async rejectLetter(req, res) {
    try {
      const { uuid } = req.params;
      const role     = req.user?.role || 'rt';
      const { notes } = req.body || {};
      const result   = await ApprovalsService.rejectLetter(uuid, role, notes);
      res.json({ success: true, data: result, message: 'Surat berhasil ditolak' });
    } catch (error) {
      console.error('Error rejectLetter:', error);
      res.status(400).json({ success: false, message: error.message || 'Gagal menolak surat' });
    }
  }

  // ─── QR VERIFY (PUBLIK) ───────────────────────────────────────────────────
  static async verifyByQrToken(req, res) {
    try {
      const { qrToken } = req.params;

      const [rows] = await pool.query(
        `SELECT l.letter_number, l.status, l.completed_at,
                lt.name AS letter_type_name,
                w.nama AS resident_name
         FROM letters l
         JOIN letter_types lt ON l.letter_type_id = lt.id
         JOIN warga w ON l.resident_id = w.id_warga
         WHERE l.qr_token = ?`,
        [qrToken]
      );

      if (!rows.length) {
        return res.status(404).json({ valid: false, message: 'Surat tidak ditemukan' });
      }

      const letter = rows[0];
      return res.json({
        valid: true,
        letter_number: letter.letter_number,
        letter_type:   letter.letter_type_name,
        resident_name: letter.resident_name,
        status:        letter.status,
        completed_at:  letter.completed_at,
      });
    } catch (err) {
      console.error('Error verifyByQrToken:', err);
      return res.status(500).json({ valid: false, message: 'Server error' });
    }
  }
}

module.exports = LettersController;
```

---

### 1.4 `backend/src/modules/letters/letters.routes.js`

**Bug:** Tidak ada route untuk `/inbox`, `/verify/:qrToken`, `/:uuid/preview-pdf`.

```js
// backend/src/modules/letters/letters.routes.js
// GANTI SELURUH ISI FILE INI

const express             = require('express');
const LettersController   = require('./letters.controller');
const { verifyToken }     = require('../../middlewares/authMiddleware');
const authRtRwMiddleware  = require('../../middlewares/authRtRwMiddleware');

const router = express.Router();

// ─── PUBLIK (tidak perlu auth) ────────────────────────────────────────────────
router.get('/types',                  LettersController.getLetterTypes);
router.get('/types/:typeId/fields',   LettersController.getTemplateFields);
router.get('/workflows',              LettersController.getWorkflowOptions);
router.get('/verify/:qrToken',        LettersController.verifyByQrToken);  // ← QR verify publik

// ─── RT/RW INBOX (auth RT/RW) ─────────────────────────────────────────────────
router.get('/inbox', authRtRwMiddleware, LettersController.getInbox);      // ← Inbox RT/RW

// ─── WARGA (auth verifyToken) ─────────────────────────────────────────────────
router.use(verifyToken);
router.get('/',                       LettersController.getMyLetters);
router.get('',                        LettersController.getMyLetters);
router.post('/drafts',                LettersController.createDraft);
router.get('/:uuid',                  LettersController.getLetterDetail);
router.post('/:uuid/submit',          LettersController.submitLetter);
router.get('/:uuid/preview-pdf',      LettersController.getPreviewPdf);    // ← PDF preview

// ─── APPROVE / REJECT (dipakai RT/RW, tapi pakai verifyToken generik) ─────────
router.post('/:uuid/approve',         LettersController.approveLetter);
router.post('/:uuid/reject',          LettersController.rejectLetter);

module.exports = router;
```

---

### 1.5 `backend/src/modules/letters/sub-modules/approvals/approvals.service.js`

**Bug:** Versi z2 menggunakan class-based approach lama. Ganti dengan versi yang lebih robust.

```js
// backend/src/modules/letters/sub-modules/approvals/approvals.service.js
// GANTI SELURUH ISI FILE INI

const pool      = require('../../../../config/db');
const { pdfQueue } = require('../../../../config/queue');

const STATUS_TRANSITIONS = {
  RT_ONLY: {
    rt:  { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  RT_THEN_RW: {
    rt:  { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw:  { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

const approveLetter = async (letterUuid, role, notes = null, signatureUrl = null) => {
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     WHERE l.uuid = ?`,
    [letterUuid]
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error(`Workflow tidak dikenal: ${letter.workflow_code}`);

  // Normalize role: admin_rt → rt, admin_rw → rw
  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;
  const transition = workflow[normalizedRole];
  if (!transition) throw new Error(`Role ${normalizedRole} tidak bisa approve workflow ${letter.workflow_code}`);

  if (!transition.from.includes(letter.status)) {
    throw new Error(`Status saat ini (${letter.status}) tidak valid untuk di-approve`);
  }

  const nextStatus = transition.to;

  // Simpan history approval
  await pool.query(
    `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
     VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
    [letter.id, letter.id, letter.current_step, notes, signatureUrl]
  );

  // Update status + step
  if (nextStatus === 'completed') {
    await pool.query(
      `UPDATE letters SET status = ?, completed_at = NOW(), current_step = current_step + 1 WHERE id = ?`,
      [nextStatus, letter.id]
    );
    // Trigger PDF final generation
    try {
      await pdfQueue.add('generate-pdf', { letterUuid: letter.uuid, type: 'final' });
    } catch (qErr) {
      console.warn('[Approvals] PDF queue tidak tersedia, skip:', qErr.message);
    }
  } else {
    await pool.query(
      `UPDATE letters SET status = ?, current_step = current_step + 1 WHERE id = ?`,
      [nextStatus, letter.id]
    );
  }

  return { nextStatus };
};

const rejectLetter = async (letterUuid, role, notes) => {
  const [[letter]] = await pool.query('SELECT * FROM letters WHERE uuid = ?', [letterUuid]);
  if (!letter) throw new Error('Surat tidak ditemukan');

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  await pool.query(
    `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
     VALUES (?, ?, ?, 'rejected', ?, NOW())`,
    [letter.id, letter.id, letter.current_step, notes || 'Tidak ada alasan']
  );

  await pool.query(
    `UPDATE letters SET status = 'rejected', rejected_by_role = ? WHERE id = ?`,
    [normalizedRole, letter.id]
  );

  return { status: 'rejected' };
};

module.exports = { approveLetter, rejectLetter };
```

---

## BAGIAN 2 — FRONTEND FIXES

---

### 2.1 `frontend/src/constants/suratStatus.js`

**Bug:** Hanya ada V1 statuses. V2 statuses dipakai di LetterListPage, LetterDetailPage, LetterInboxPage.

```js
// frontend/src/constants/suratStatus.js
// GANTI SELURUH ISI FILE INI

// ─── V1 (legacy — pengajuan_surat tinyint status) ─────────────────────────────
export const SURAT_STATUS = {
  MENUNGGU:  1,
  DISETUJUI: 2,
  DITOLAK:   3,
};

export const STATUS_LABEL = {
  1: 'Menunggu Verifikasi',
  2: 'Disetujui',
  3: 'Ditolak',
};

export const STATUS_COLOR = {
  1: 'bg-amber-100 text-amber-800 border-amber-200',
  2: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  3: 'bg-rose-100 text-rose-800 border-rose-200',
};

// ─── V2 (letters — string enum status) ───────────────────────────────────────
export const LETTER_STATUS_V2 = {
  draft:               { label: 'Draft',          color: 'bg-slate-100 text-slate-600 border-slate-200' },
  submitted:           { label: 'Menunggu RT',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_review_rt:        { label: 'Diproses RT',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved_rt:         { label: 'Disetujui RT',   color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  in_review_rw:        { label: 'Diproses RW',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  approved_rw:         { label: 'Disetujui RW',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
  revision_requested:  { label: 'Perlu Revisi',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  rejected:            { label: 'Ditolak',        color: 'bg-red-50 text-red-700 border-red-200' },
  completed:           { label: 'Selesai',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:           { label: 'Dibatalkan',     color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

/**
 * Helper: ambil info status V2, fallback jika tidak dikenal
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
export function getStatusV2(status) {
  return LETTER_STATUS_V2[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
}
```

---

### 2.2 `frontend/src/services/ttdService.js`

**Bug:** Export sebagai object `ttdService`, tapi TtdSurat.jsx di z1 import sebagai named function `{ getTtd, uploadTtd }`. Versi z2 TtdSurat.jsx menggunakan object approach tapi panggil endpoint yang berbeda (`/ttd/current-ttd` vs `/ttd`). Unifikasi ke satu approach.

```js
// frontend/src/services/ttdService.js
// GANTI SELURUH ISI FILE INI

import { api } from '../utils/api';

/**
 * Ambil TTD digital milik RT/RW yang sedang login.
 * BE route: GET /api/ttd/current-ttd
 */
export const getTtd = async () => {
  const { data, error } = await api.get('/ttd/current-ttd');
  if (error) throw new Error(error);
  return data?.data ?? data;
};

/**
 * Upload TTD baru (file gambar atau blob dari canvas).
 * BE route: POST /api/ttd/upload-ttd  (multipart/form-data, field: ttdImage)
 * @param {FormData} formData
 */
export const uploadTtd = async (formData) => {
  const { data, error } = await api.postFormData('/ttd/upload-ttd', formData);
  if (error) throw new Error(error);
  return data;
};

// ─── Legacy export (agar tidak breaking jika masih ada yang import object) ────
export const ttdService = { getTtd, uploadTtd };
```

---

### 2.3 `frontend/src/pages/rtrw/TtdSurat.jsx`

**Bug:** Canvas ref tidak stabil di react-signature-canvas@1.1.0-alpha.2. Ganti `sigCanvas.current.isEmpty()` check dengan fallback, dan pertahankan UI bagus dari z2.

```jsx
// frontend/src/pages/rtrw/TtdSurat.jsx
// GANTI SELURUH ISI FILE INI

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Award, Check, Upload, Edit3, Eraser,
  Loader2, AlertCircle, Trash2,
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { getTtd, uploadTtd } from '../../services/ttdService';

export default function TtdSurat() {
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [isSaved,   setIsSaved]   = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const sigCanvas = useRef(null);

  useEffect(() => {
    fetchTtd();
  }, []);

  const fetchTtd = async () => {
    setLoading(true);
    try {
      const result = await getTtd();
      const url = result?.ttd_url || result?.ttd_digital || null;
      setSignatureUrl(url);
    } catch (_) {
      // Belum ada TTD — normal untuk akun baru
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError('');
  };

  // Helper: konversi dataURL → Blob
  const dataURLtoBlob = (dataUrl) => {
    const [header, data] = dataUrl.split(',');
    const mime   = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    return new Blob([buffer], { type: mime });
  };

  const handleSaveDrawing = async () => {
    const canvas = sigCanvas.current;
    if (!canvas) { setError('Canvas tidak tersedia.'); return; }

    // react-signature-canvas@1.1.0-alpha.2: isEmpty() kadang false positive
    // Ambil raw canvas dulu, cek ukuran pixel
    const rawCanvas = typeof canvas.getCanvas === 'function'
      ? canvas.getCanvas()
      : canvas._canvas;

    if (!rawCanvas) { setError('Tidak bisa membaca canvas.'); return; }

    const dataUrl = rawCanvas.toDataURL('image/png');
    // Cek apakah canvas benar-benar kosong (hanya pixel transparan)
    const isEmpty = typeof canvas.isEmpty === 'function'
      ? canvas.isEmpty()
      : dataUrl === rawCanvas.getContext('2d').canvas.toDataURL(); // fallback

    if (isEmpty) { setError('Tanda tangan masih kosong.'); return; }

    setError('');
    setSaving(true);
    try {
      const blob     = dataURLtoBlob(dataUrl);
      const formData = new FormData();
      formData.append('ttdImage', blob, 'signature.png');

      const result = await uploadTtd(formData);
      const url    = result?.data?.ttd_url || result?.ttd_url || null;

      setSignatureUrl(url);
      setIsSaved(true);
      setIsDrawing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      setError('Gagal menyimpan tanda tangan. Coba lagi.');
      console.error('[TTD]', e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('ttdImage', file);
      const result = await uploadTtd(formData);
      const url    = result?.data?.ttd_url || result?.ttd_url || null;
      setSignatureUrl(url);
      setIsSaved(true);
      setIsDrawing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      setError('Gagal mengunggah gambar.');
      console.error('[TTD]', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/rtrw/dashboard"
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-300 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tanda Tangan Digital</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola e-signature untuk surat pengantar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">

        {/* Alert sukses */}
        {isSaved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Tanda tangan berhasil disimpan dan aktif!</span>
          </div>
        )}

        {/* Alert error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat data tanda tangan...</span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-8 bg-slate-50/50 flex flex-col items-center min-h-[320px] relative">

            {/* Mode: Tampil TTD tersimpan */}
            {!isDrawing && signatureUrl ? (
              <div className="text-center space-y-5 w-full">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Tanda Tangan Aktif
                </p>
                <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm mx-auto shadow-sm flex items-center justify-center min-h-[140px]">
                  <img src={signatureUrl} alt="Tanda Tangan Digital" className="max-h-36 object-contain" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => { setIsDrawing(true); setError(''); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5282] transition shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Gambar Ulang
                  </button>
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4" />
                    Ganti File
                    <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handleUpload} disabled={saving} />
                  </label>
                </div>
              </div>

            ) : (
              /* Mode: Gambar TTD */
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                  <p className="text-sm font-semibold text-slate-700">Gambar Tanda Tangan:</p>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Bersihkan
                  </button>
                </div>

                {/* Canvas area */}
                <div className="bg-white border-2 border-slate-200 rounded-xl shadow-inner overflow-hidden max-w-lg mx-auto touch-none">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    backgroundColor="white"
                    canvasProps={{
                      width:  600,
                      height: 240,
                      style: { width: '100%', height: 'auto', display: 'block' },
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                  {signatureUrl && (
                    <button
                      onClick={() => { setIsDrawing(false); setError(''); }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    onClick={handleSaveDrawing}
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5282] transition shadow disabled:opacity-60"
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                      : <><Award className="w-4 h-4" /> Simpan Tanda Tangan</>
                    }
                  </button>
                  <span className="text-slate-300 hidden sm:block">|</span>
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4" />
                    Unggah Gambar
                    <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handleUpload} disabled={saving} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-slate-400 text-center">
          Tanda tangan akan ditempelkan otomatis saat Anda menyetujui surat pengantar warga.
        </p>
      </div>
    </div>
  );
}
```

---

### 2.4 `frontend/src/features/letters/components/wizard/Step6PdfPreview.jsx`

**Bug:** Mock HTML statis. Harus fetch PDF real dari backend endpoint `/:uuid/preview-pdf`.

```jsx
// frontend/src/features/letters/components/wizard/Step6PdfPreview.jsx
// GANTI SELURUH ISI FILE INI

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw, Info } from 'lucide-react';
import { api } from '../../../../utils/api';

const fetchPreviewPdf = async (uuid) => {
  const { data, error } = await api.get(`/v2/letters/${uuid}/preview-pdf`);
  if (error) throw new Error(error);
  return data?.data?.pdf_url || null;
};

export default function Step6PdfPreview({ wizard }) {
  // Ambil draftUuid dari wizard state — disesuaikan dengan hook useLetterWizard
  const draftUuid = wizard?.draftUuid || wizard?.uuid || null;

  const {
    data: pdfUrl,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey:  ['pdf-preview', draftUuid],
    queryFn:   () => fetchPreviewPdf(draftUuid),
    enabled:   !!draftUuid,
    staleTime: 1000 * 60 * 5, // cache 5 menit
    retry:     1,
  });

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Preview Surat</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Periksa tampilan surat sebelum dikirim ke RT/RW.
        </p>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center min-h-[480px] relative">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Sedang generate PDF preview...</p>
            <p className="text-xs text-slate-400">Ini mungkin butuh beberapa detik</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <Info className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Gagal memuat PDF preview</p>
              <p className="text-xs text-slate-400 mt-1">{error?.message || 'Server tidak merespons'}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Tidak ada draftUuid */}
        {!draftUuid && !isLoading && (
          <div className="text-center p-6 text-slate-400">
            <p className="text-sm">Draft belum tersedia. Simpan data terlebih dahulu.</p>
          </div>
        )}

        {/* PDF Iframe viewer */}
        {pdfUrl && !isLoading && (
          <>
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[480px] border-0"
              title="Preview Surat"
            />
            {/* Floating download button */}
            <a
              href={pdfUrl}
              download="preview-surat.pdf"
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </>
        )}
      </div>

      {/* Info note */}
      <p className="flex-shrink-0 flex items-center gap-1.5 text-xs text-slate-400 justify-center">
        <Info className="w-3.5 h-3.5" />
        Tampilan final PDF saat sudah ditandatangani mungkin sedikit berbeda.
      </p>
    </div>
  );
}
```

---

### 2.5 `frontend/src/features/letters/pages/LetterDetailPage.jsx`

**Bug:** Stub `return <div>Letter Detail</div>`. Harus menampilkan detail surat + timeline + tombol approve/reject untuk RT/RW.

```jsx
// frontend/src/features/letters/pages/LetterDetailPage.jsx
// GANTI SELURUH ISI FILE INI

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText,
  Download, MessageSquare, Loader2, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';
import { getStatusV2 } from '../../../constants/suratStatus';

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const STATUS_ORDER = [
  'draft', 'submitted', 'in_review_rt', 'approved_rt',
  'in_review_rw', 'completed',
];

// ─── Sub-komponen: Status Tracker ─────────────────────────────────────────────
function StatusTracker({ status, workflowCode }) {
  // RT_ONLY: skip rw steps
  const steps = workflowCode === 'RT_ONLY'
    ? ['draft', 'submitted', 'in_review_rt', 'completed']
    : STATUS_ORDER;

  const currentIdx = steps.indexOf(status);

  const STEP_LABELS = {
    draft:         'Draft',
    submitted:     'Dikirim',
    in_review_rt:  'Proses RT',
    approved_rt:   'Disetujui RT',
    in_review_rw:  'Proses RW',
    completed:     'Selesai',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Progres Surat</p>
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done = i <= currentIdx;
          const isLast = i === steps.length - 1;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${done ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`} />
                <span className="text-[9px] text-slate-400 mt-1 text-center max-w-[48px] leading-tight">
                  {STEP_LABELS[s]}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mb-3 transition-colors ${done && i < currentIdx ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-komponen: Approval Timeline ─────────────────────────────────────────
function ApprovalTimeline({ approvals }) {
  if (!approvals?.length) return null;

  const ICONS = {
    approved:           <CheckCircle className="w-4 h-4 text-emerald-500" />,
    rejected:           <XCircle className="w-4 h-4 text-red-500" />,
    revision_requested: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  };

  const LABELS = {
    approved:           'Menyetujui',
    rejected:           'Menolak',
    revision_requested: 'Minta Revisi',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Riwayat Proses</p>
      <div className="space-y-3">
        {approvals.map((a, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 flex-shrink-0">{ICONS[a.action] ?? <Clock className="w-4 h-4 text-slate-400" />}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{a.approver_name || 'Petugas'}</span>
                {' — '}
                <span>{LABELS[a.action] || a.action}</span>
              </p>
              {a.notes && (
                <p className="text-xs text-slate-500 mt-0.5 bg-slate-50 rounded px-2 py-1">{a.notes}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.acted_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-komponen: Approve/Reject Panel (hanya untuk RT/RW) ──────────────────
function ApprovalPanel({ uuid, status, onSuccess }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState(null); // null | 'approve' | 'reject'

  const canApprove =
    (user?.role === 'rt' && ['submitted', 'in_review_rt'].includes(status)) ||
    (user?.role === 'rw' && ['approved_rt', 'in_review_rw'].includes(status));

  const mutation = useMutation({
    mutationFn: async (action) => {
      const { data, error } = await api.post(`/v2/letters/${uuid}/${action}`, { notes });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
      setMode(null);
      setNotes('');
    },
  });

  if (!canApprove) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tindakan</p>

      {mutation.isError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {mutation.error?.message || 'Gagal memproses. Coba lagi.'}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Catatan untuk warga (opsional)"
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
      />

      <div className="flex gap-3">
        <button
          onClick={() => mutation.mutate('approve')}
          disabled={mutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Setujui
        </button>
        <button
          onClick={() => mutation.mutate('reject')}
          disabled={mutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Tolak
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LetterDetailPage() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const backPath = user?.role === 'warga' ? '/warga/riwayat' : '/rtrw/inbox';

  const { data: letter, isLoading, isError } = useQuery({
    queryKey: ['letter-detail', uuid],
    queryFn: async () => {
      const { data, error } = await api.get(`/v2/letters/${uuid}`);
      if (error) throw new Error(error);
      return data?.data;
    },
    enabled: !!uuid,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !letter) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 text-center py-16 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-slate-600">Surat tidak ditemukan</p>
        <Link to={backPath} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  const statusInfo    = getStatusV2(letter.status);
  const finalPdf      = letter.pdf_versions?.find((p) => p.type === 'final');
  const workflowCode  = letter.workflow_code || 'RT_ONLY';

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">

      {/* Back + Header */}
      <div>
        <Link
          to={backPath}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {letter.letter_type_name || 'Surat Keterangan'}
            </h1>
            {letter.letter_number && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">No. {letter.letter_number}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Diajukan {formatDate(letter.created_at)}</p>
          </div>
          <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Status Tracker */}
      <StatusTracker status={letter.status} workflowCode={workflowCode} />

      {/* Data Surat */}
      {letter.field_values?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Surat</p>
          <dl className="space-y-2">
            {letter.field_values.map((fv) => (
              <div key={fv.field_key} className="flex gap-3 text-sm">
                <dt className="text-slate-500 capitalize flex-shrink-0 w-40 text-xs">
                  {fv.field_key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-slate-800 font-medium text-xs">{fv.value || '-'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Approval Timeline */}
      <ApprovalTimeline approvals={letter.approvals} />

      {/* Panel Approve/Reject (hanya RT/RW) */}
      <ApprovalPanel uuid={uuid} status={letter.status} />

      {/* Download PDF Final */}
      {finalPdf && (
        <a
          href={finalPdf.file_url}
          download="surat-final.pdf"
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Surat Final
        </a>
      )}
    </div>
  );
}
```

---

### 2.6 `frontend/src/features/letters/pages/LetterInboxPage.jsx`

**Bug:** Stub. Harus menampilkan inbox RT/RW dengan list surat masuk.

```jsx
// frontend/src/features/letters/pages/LetterInboxPage.jsx
// GANTI SELURUH ISI FILE INI

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Inbox, Clock, CheckCircle, Search, ChevronRight, Loader2, FileText,
} from 'lucide-react';
import { api } from '../../../utils/api';
import { getStatusV2 } from '../../../constants/suratStatus';

const formatDate = (str) => {
  if (!str) return '-';
  const d = new Date(str);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const TABS = [
  { key: 'all',     label: 'Semua' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'process', label: 'Diproses' },
];

const WAITING_STATUSES  = ['submitted', 'approved_rt'];
const PROCESS_STATUSES  = ['in_review_rt', 'in_review_rw'];

export default function LetterInboxPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search,    setSearch]    = useState('');

  const { data: letters = [], isLoading, isError, refetch } = useQuery({
    queryKey:    ['inbox-rtrw'],
    queryFn:     async () => {
      const { data, error } = await api.get('/v2/letters/inbox');
      if (error) throw new Error(error);
      return data?.data || [];
    },
    refetchInterval: 30_000, // auto-refresh 30 detik
    staleTime:       15_000,
  });

  const filtered = letters.filter((l) => {
    const matchTab =
      activeTab === 'all'     ? true :
      activeTab === 'waiting' ? WAITING_STATUSES.includes(l.status) :
      activeTab === 'process' ? PROCESS_STATUSES.includes(l.status) :
      true;

    const matchSearch = !search || [
      l.resident_name, l.letter_type_name, l.subject,
    ].some((s) => s?.toLowerCase().includes(search.toLowerCase()));

    return matchTab && matchSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Surat Masuk</h1>
          <p className="text-slate-500 mt-1 text-sm">Surat warga yang perlu diproses.</p>
        </div>
        <p className="text-xs text-slate-400">
          {letters.length > 0 ? `${letters.length} surat total` : ''}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Tab */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.key === 'waiting' && WAITING_STATUSES.some((s) => letters.some((l) => l.status === s)) && (
                  <span className="ml-1.5 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {letters.filter((l) => WAITING_STATUSES.includes(l.status)).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama warga / jenis surat..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/20 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Memuat surat masuk...</span>
            </div>
          )}

          {isError && (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">Gagal memuat data.</p>
              <button onClick={refetch} className="mt-2 text-xs text-blue-600 hover:underline">
                Coba lagi
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Tidak ada surat masuk</p>
              <p className="text-xs mt-1">
                {search ? 'Coba ubah kata kunci pencarian.' : 'Belum ada surat dari warga.'}
              </p>
            </div>
          )}

          {!isLoading && filtered.map((letter) => {
            const statusInfo = getStatusV2(letter.status);
            const isUrgent   = letter.status === 'submitted';

            return (
              <Link
                key={letter.uuid}
                to={`/rtrw/surat/${letter.uuid}`}
                className={`flex items-center gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition group ${
                  isUrgent ? 'border-l-4 border-l-amber-400' : ''
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                  isUrgent ? 'bg-amber-50' : 'bg-slate-100'
                }`}>
                  <FileText className={`w-4 h-4 ${isUrgent ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {letter.resident_name || 'Warga'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {letter.letter_type_name}
                    {letter.purpose ? ` — ${letter.purpose}` : ''}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(letter.created_at)}</p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

### 2.7 `frontend/src/features/letters/pages/QrVerifyPage.jsx`

**Bug:** Stub. Harus menampilkan verifikasi surat via QR token dari URL.

```jsx
// frontend/src/features/letters/pages/QrVerifyPage.jsx
// GANTI SELURUH ISI FILE INI

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle, XCircle, Loader2, Shield, QrCode, Calendar, User, FileText, Hash,
} from 'lucide-react';
import { api } from '../../../utils/api';

const formatDate = (str) => {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const verifyLetter = async (qrToken) => {
  const { data, error } = await api.get(`/v2/letters/verify/${qrToken}`);
  // Endpoint ini return { valid, ... } bukan { success, data }
  if (error) return { valid: false, message: error };
  return data;
};

export default function QrVerifyPage() {
  const { qrToken } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-letter', qrToken],
    queryFn:  () => verifyLetter(qrToken),
    enabled:  !!qrToken,
    retry:    false,
    staleTime: Infinity,
  });

  const isValid = data?.valid === true;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-[#1e3a5f] px-6 py-8 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Verifikasi Surat</h1>
          <p className="text-blue-200 text-sm mt-1">SIPRAGA V2 — Sistem Persuratan RT/RW</p>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Memverifikasi surat...</p>
            </div>
          )}

          {/* Error / Not found */}
          {(isError || data?.valid === false) && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Surat Tidak Valid</p>
                <p className="text-sm text-slate-500 mt-1">
                  {data?.message || 'Token QR tidak ditemukan atau sudah tidak berlaku.'}
                </p>
              </div>
            </div>
          )}

          {/* Valid */}
          {!isLoading && isValid && (
            <div className="space-y-5">
              {/* Valid badge */}
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-sm">Surat Terverifikasi</span>
              </div>

              {/* Detail */}
              <div className="space-y-3">
                {[
                  { icon: User,     label: 'Nama Warga',      value: data.resident_name },
                  { icon: FileText, label: 'Jenis Surat',     value: data.letter_type },
                  { icon: Hash,     label: 'Nomor Surat',     value: data.letter_number || '—' },
                  { icon: Calendar, label: 'Tanggal Selesai', value: formatDate(data.completed_at) },
                  { icon: Shield,   label: 'Status',          value: data.status },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-slate-300">
            Diverifikasi melalui SIPRAGA — Sistem Informasi Persuratan Digital RT/RW
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## BAGIAN 3 — ROUTING FIXES

---

### 3.1 `frontend/src/App.jsx`

Pastikan route untuk LetterDetailPage dan LetterInboxPage benar di App.jsx. Tambahkan route yang mungkin belum ada:

```jsx
// frontend/src/App.jsx
// TAMBAH route-route berikut jika belum ada, sesuaikan dengan struktur App.jsx yang ada

// Di bagian import, pastikan ada:
import LetterDetailPage from './features/letters/pages/LetterDetailPage';
import LetterInboxPage  from './features/letters/pages/LetterInboxPage';
import QrVerifyPage     from './features/letters/pages/QrVerifyPage';

// Di dalam Router, pastikan ada route:
// Publik (tanpa auth):
<Route path="/verify/:qrToken" element={<QrVerifyPage />} />

// Warga (protected):
<Route path="/warga/surat/:uuid" element={<LetterDetailPage />} />

// RT/RW (protected):
<Route path="/rtrw/inbox"        element={<LetterInboxPage />} />
<Route path="/rtrw/surat/:uuid"  element={<LetterDetailPage />} />
```

---

## BAGIAN 4 — CHECKLIST VERIFIKASI

Setelah apply semua perubahan di atas, verifikasi dengan:

### Backend Tests

```bash
# 1. Cek authRtRwMiddleware — req.user dan req.tenantId harus ada
# Login sebagai RT, hit GET /api/v2/letters/inbox → harus return data, bukan error

# 2. Cek inbox endpoint
curl -H "Authorization: Bearer <token_rt>" http://localhost:3000/api/v2/letters/inbox
# Expected: { success: true, data: [...] }

# 3. Cek QR verify (publik, tanpa token)
curl http://localhost:3000/api/v2/letters/verify/INVALID-TOKEN
# Expected: { valid: false, message: 'Surat tidak ditemukan' }

# 4. Cek preview PDF (butuh surat yang sudah ada di DB)
curl -H "Authorization: Bearer <token_warga>" http://localhost:3000/api/v2/letters/<uuid>/preview-pdf
# Expected: { success: true, data: { pdf_url: 'data:application/pdf;base64,...' } }

# 5. Cek approve
curl -X POST -H "Authorization: Bearer <token_rt>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Disetujui"}' \
  http://localhost:3000/api/v2/letters/<uuid>/approve
# Expected: { success: true, data: { nextStatus: 'completed' | 'approved_rt' } }
```

### Frontend Checklist

- [ ] `TtdSurat.jsx` — canvas dapat digambar, simpan tidak error
- [ ] `TtdSurat.jsx` — upload file PNG/JPG berhasil
- [ ] `TtdSurat.jsx` — TTD tersimpan tampil setelah halaman reload
- [ ] `Step6PdfPreview.jsx` — iframe PDF tampil (bukan HTML mock)
- [ ] `Step6PdfPreview.jsx` — loading spinner saat generate
- [ ] `LetterDetailPage.jsx` — detail surat tampil lengkap (field values, timeline)
- [ ] `LetterDetailPage.jsx` — tombol Setujui/Tolak muncul untuk RT/RW
- [ ] `LetterDetailPage.jsx` — tombol Download muncul jika status `completed`
- [ ] `LetterInboxPage.jsx` — list surat masuk tampil untuk RT/RW
- [ ] `LetterInboxPage.jsx` — tab filter (Semua/Menunggu/Diproses) berfungsi
- [ ] `QrVerifyPage.jsx` — valid: tampil card hijau dengan info surat
- [ ] `QrVerifyPage.jsx` — invalid: tampil card merah

---

## BAGIAN 5 — CATATAN PENTING

### Tentang ttdService Import Pattern

Z2 menggunakan `import { ttdService } from '../../services/ttdService'` di TtdSurat.jsx.  
File ttdService.js yang baru ini export **keduanya**: named function `getTtd, uploadTtd` DAN object `ttdService`.  
Tidak perlu ubah import di TtdSurat.jsx — cukup konsisten dengan satu pattern.

### Tentang Route `/rtrw/surat/:uuid` vs `/letters/:uuid`

Z2 menggunakan prefix route yang berbeda antara warga dan RT/RW:
- Warga: `/warga/surat/:uuid`
- RT/RW: `/rtrw/surat/:uuid`

Keduanya merender `LetterDetailPage` yang sama — role dari AuthContext yang menentukan tampilan tombol.

### Tentang PDF Preview dengan Base64

PDF di-embed sebagai `data:application/pdf;base64,...` string. Ini works di Chrome/Firefox modern tapi tidak di Safari iOS. Jika perlu support Safari, upload ke Cloudinary/Supabase dan return URL asli.

### Tentang Queue PDF (BullMQ)

Jika Redis tidak tersedia, `approvals.service.js` sudah wrap `pdfQueue.add()` dalam try-catch, jadi tidak crash. PDF final tidak akan digenerate tapi status tetap `completed`.
```

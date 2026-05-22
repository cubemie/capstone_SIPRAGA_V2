/**
 * upload.js  —  Centralized Multer Configuration
 *
 * Semua konfigurasi upload file ada di sini.
 * Import named export yang sesuai di route masing-masing.
 *
 * Named exports:
 *   uploadSurat      → /uploads/surat/          (PDF, DOCX — maks 5 MB)
 *   uploadSuratSigned → /uploads/signed/         (PDF, DOCX — maks 10 MB)
 *   uploadKtp        → /uploads/ktp/             (JPG, PNG — maks 3 MB)
 *   uploadTtd        → /uploads/ttd/             (JPG, PNG — maks 2 MB)
 *   uploadTemplate   → /uploads/template_surat/  (PDF, DOCX — maks 10 MB)
 */

const multer = require('multer');
const path   = require('path');

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Buat diskStorage multer dengan folder dan prefix nama file tertentu.
 * @param {string} destFolder - Relatif terhadap root backend
 * @param {string} prefix     - Prefix nama file (e.g. 'surat', 'ttd')
 */
function makeStorage(destFolder, prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destFolder),
    filename:    (req, file, cb) => {
      const ext      = path.extname(file.originalname).toLowerCase();
      const unique   = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
      cb(null, unique + ext);
    },
  });
}

/**
 * File filter berdasarkan daftar ekstensi yang diizinkan.
 * @param {string[]} allowedExts - Array ekstensi tanpa titik, lowercase (e.g. ['pdf', 'docx'])
 * @param {string}   label       - Label untuk pesan error
 */
function makeExtFilter(allowedExts, label) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Format file tidak valid. Hanya ${label} yang diizinkan.`));
    }
  };
}

/**
 * File filter berdasarkan MIME type.
 * @param {string[]} allowedMimes - Array MIME type yang diizinkan
 * @param {string}   label        - Label untuk pesan error
 */
function makeMimeFilter(allowedMimes, label) {
  return (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Format file tidak valid. Hanya ${label} yang diizinkan.`));
    }
  };
}

// ─── Dokumen Surat (PDF / DOCX, maks 5 MB) ───────────────────────────────────

const docFilter = makeExtFilter(['pdf', 'docx'], 'PDF atau DOCX');

/** Upload surat pengajuan warga */
const uploadSurat = multer({
  storage:    makeStorage('uploads/surat', 'surat'),
  fileFilter: docFilter,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/** Upload surat yang sudah ditandatangani RT/RW */
const uploadSuratSigned = multer({
  storage:    makeStorage('uploads/signed', 'signed'),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/** Upload template surat (superadmin) */
const uploadTemplate = multer({
  storage:    makeStorage('uploads/template_surat', 'template'),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Gambar / Foto ────────────────────────────────────────────────────────────

const imageFilter = makeMimeFilter(['image/jpeg', 'image/png'], 'JPG atau PNG');

/** Upload foto KTP warga */
const uploadKtp = multer({
  storage:    makeStorage('uploads/ktp', 'ktp'),
  fileFilter: imageFilter,
  limits:     { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

/** Upload tanda tangan digital RT/RW */
const uploadTtd = multer({
  storage:    makeStorage('uploads/ttd', 'ttd'),
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  uploadSurat,
  uploadSuratSigned,
  uploadKtp,
  uploadTtd,
  uploadTemplate,
};

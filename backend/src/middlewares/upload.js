/**
 * upload.js  —  Centralized Multer Configuration (Cloudinary)
 *
 * File disimpan ke Cloudinary agar tidak hilang saat Railway restart.
 * Semua file dikelompokkan di folder `rt-rw/<subfolder>` di Cloudinary.
 *
 * Named exports:
 *   uploadSurat       → rt-rw/surat          (PDF, DOCX — maks 5 MB)
 *   uploadSuratSigned → rt-rw/signed         (PDF, DOCX — maks 10 MB)
 *   uploadKtp         → rt-rw/ktp            (JPG, PNG  — maks 3 MB)
 *   uploadTtd         → rt-rw/ttd            (JPG, PNG  — maks 2 MB)
 *   uploadTemplate    → rt-rw/template_surat (PDF, DOCX — maks 10 MB)
 */

const multer             = require('multer');
const cloudinary         = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Konfigurasi Cloudinary ───────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Buat CloudinaryStorage untuk folder tertentu.
 * @param {string}   folder          - Subfolder di Cloudinary (di bawah rt-rw/)
 * @param {string[]} allowedFormats  - Ekstensi yang diizinkan (tanpa titik)
 */
function makeCloudinaryStorage(folder, allowedFormats) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder:           `rt-rw/${folder}`,
      allowed_formats:  allowedFormats,
      resource_type:    'auto', // otomatis deteksi image/video/raw (untuk PDF/DOCX)
    },
  });
}

/**
 * File filter berdasarkan daftar ekstensi yang diizinkan.
 * @param {string[]} allowedExts - Array ekstensi tanpa titik, lowercase
 * @param {string}   label       - Label untuk pesan error
 */
function makeExtFilter(allowedExts, label) {
  return (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
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

// ─── Filters ──────────────────────────────────────────────────────────────────

const docFilter   = makeExtFilter(['pdf', 'docx'], 'PDF atau DOCX');
const imageFilter = makeMimeFilter(['image/jpeg', 'image/png'], 'JPG atau PNG');

// ─── Multer Instances ─────────────────────────────────────────────────────────

/** Upload surat pengajuan warga (PDF/DOCX, maks 5 MB) */
const uploadSurat = multer({
  storage:    makeCloudinaryStorage('surat', ['pdf', 'docx']),
  fileFilter: docFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
});

/** Upload surat yang sudah ditandatangani RT/RW (PDF/DOCX, maks 10 MB) */
const uploadSuratSigned = multer({
  storage:    makeCloudinaryStorage('signed', ['pdf', 'docx']),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
});

/** Upload template surat oleh superadmin (PDF/DOCX, maks 10 MB) */
const uploadTemplate = multer({
  storage:    makeCloudinaryStorage('template_surat', ['pdf', 'docx']),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
});

/** Upload foto KTP warga (JPG/PNG, maks 3 MB) */
const uploadKtp = multer({
  storage:    makeCloudinaryStorage('ktp', ['jpg', 'jpeg', 'png']),
  fileFilter: imageFilter,
  limits:     { fileSize: 3 * 1024 * 1024 },
});

/** Upload tanda tangan digital RT/RW (JPG/PNG, maks 2 MB) */
const uploadTtd = multer({
  storage:    makeCloudinaryStorage('ttd', ['jpg', 'jpeg', 'png']),
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  uploadSurat,
  uploadSuratSigned,
  uploadKtp,
  uploadTtd,
  uploadTemplate,
};

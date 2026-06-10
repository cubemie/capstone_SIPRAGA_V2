/**
 * upload.js  —  Centralized Multer Configuration (Supabase)
 *
 * File disimpan ke Supabase Storage.
 * Semua file dikelompokkan di folder `rt-rw/<subfolder>` di Supabase.
 *
 * Named exports:
 *   uploadSurat       → rt-rw/surat          (PDF, DOCX — maks 5 MB)
 *   uploadSuratSigned → rt-rw/signed         (PDF, DOCX — maks 10 MB)
 *   uploadKtp         → rt-rw/ktp            (JPG, PNG  — maks 3 MB)
 *   uploadTtd         → rt-rw/ttd            (JPG, PNG  — maks 2 MB)
 *   uploadTemplate    → rt-rw/template_surat (PDF, DOCX — maks 10 MB)
 */

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// ─── Konfigurasi Supabase ────────────────────────────────────────────────────

// Kita gunakan env jika ada, fallback ke hardcoded info dari user
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://avlwwbkhsrubhsfwbgpr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bHd3Ymtoc3J1YmhzZndiZ3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4MTgxOSwiZXhwIjoyMDk2NjU3ODE5fQ.dJRzNTWroMDCkJ3Zd9PXxsJklG02XzwjT6iHdlt_-yc';
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'sipraga-storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Custom Multer Storage untuk Supabase ───────────────────────────────────

function SupabaseStorage(opts) {
  this.folder = opts.folder;
}

SupabaseStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const ext = file.originalname.split('.').pop();
  const filename = `rt-rw/${this.folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
  
  const chunks = [];
  file.stream.on('data', (chunk) => chunks.push(chunk));
  file.stream.on('end', async () => {
    const buffer = Buffer.concat(chunks);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
          contentType: file.mimetype,
          upsert: false
        });
        
      if (error) {
        return cb(error);
      }
      
      const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
      
      cb(null, {
        path: publicUrl, // Semua controller menggunakan req.file.path
        size: buffer.length,
        filename: filename
      });
    } catch (err) {
      cb(err);
    }
  });
  file.stream.on('error', (err) => cb(err));
};

SupabaseStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  // Not implemented for simplicity
  cb(null);
};

function makeSupabaseStorage(folder) {
  return new SupabaseStorage({ folder });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
const imageFilter = makeMimeFilter(['image/jpeg', 'image/png', 'image/jpg'], 'JPG atau PNG');

// ─── Multer Instances ─────────────────────────────────────────────────────────

/** Upload surat pengajuan warga (PDF/DOCX, maks 5 MB) */
const uploadSurat = multer({
  storage:    makeSupabaseStorage('surat'),
  fileFilter: docFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
});

/** Upload surat yang sudah ditandatangani RT/RW (PDF/DOCX, maks 10 MB) */
const uploadSuratSigned = multer({
  storage:    makeSupabaseStorage('signed'),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
});

/** Upload template surat oleh superadmin (PDF/DOCX, maks 10 MB) */
const uploadTemplate = multer({
  storage:    makeSupabaseStorage('template_surat'),
  fileFilter: docFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
});

/** Upload foto KTP warga (JPG/PNG, maks 3 MB) */
const uploadKtp = multer({
  storage:    makeSupabaseStorage('ktp'),
  fileFilter: imageFilter,
  limits:     { fileSize: 3 * 1024 * 1024 },
});

/** Upload tanda tangan digital RT/RW (JPG/PNG, maks 2 MB) */
const uploadTtd = multer({
  storage:    makeSupabaseStorage('ttd'),
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

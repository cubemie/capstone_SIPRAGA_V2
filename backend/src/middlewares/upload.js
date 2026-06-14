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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

function decodeJwtPayload(token) {
  try {
    const [, payload] = String(token || '').split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (_) {
    return null;
  }
}

function assertSupabaseConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!BUCKET_NAME) missing.push('SUPABASE_BUCKET');

  if (missing.length > 0) {
    throw new Error(`[upload.js] Konfigurasi Supabase belum lengkap: ${missing.join(', ')}`);
  }

  const payload = decodeJwtPayload(SUPABASE_KEY);
  if (!payload || payload.role !== 'service_role') {
    throw new Error('[upload.js] SUPABASE_SERVICE_ROLE_KEY tidak valid. Pastikan menggunakan service_role key, bukan anon key.');
  }
}

assertSupabaseConfig();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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
 * File filter gambar yang toleran terhadap variasi metadata browser.
 * Beberapa hasil export dari canvas/signature pad tetap berformat PNG/JPG,
 * tetapi bisa terkirim dengan mimetype generik. Karena itu, kita cek MIME
 * dan ekstensi filename sekaligus.
 * @param {string[]} allowedMimes
 * @param {string[]} allowedExts
 * @param {string}   label
 */
function makeImageFilter(allowedMimes, allowedExts, label) {
  return (req, file, cb) => {
    const originalName = String(file.originalname || '');
    const ext = originalName.includes('.')
      ? originalName.split('.').pop().toLowerCase()
      : '';

    const mimeAllowed = allowedMimes.includes(file.mimetype);
    const extAllowed = allowedExts.includes(ext);

    if (mimeAllowed || extAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Format file tidak valid. Hanya ${label} yang diizinkan.`));
    }
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────

const docFilter   = makeExtFilter(['pdf', 'docx'], 'PDF atau DOCX');
const imageFilter = makeImageFilter(
  ['image/jpeg', 'image/png', 'image/jpg'],
  ['jpg', 'jpeg', 'png'],
  'JPG atau PNG'
);

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

/** Upload avatar user (JPG/PNG, maks 2 MB) */
const uploadAvatar = multer({
  storage:    makeSupabaseStorage('avatar'),
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
  uploadAvatar,
};

/**
 * validateSurat.js — Middleware validasi input untuk endpoint surat
 *
 * Menggunakan express-validator untuk sanitasi dan validasi body request.
 * Dipasang sebagai middleware sebelum controller di suratRoutes.
 */

const { body, validationResult } = require('express-validator');

/**
 * Helper: tangkap hasil validasi dan kirim error jika ada.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validasi gagal. Periksa kembali data yang dikirim.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Validasi untuk POST /api/surat/ajukan (warga mengajukan surat baru).
 */
const validateAjukanSurat = [
  body('subjek')
    .notEmpty().withMessage('Subjek surat wajib diisi.')
    .trim()
    .isLength({ max: 255 }).withMessage('Subjek maksimal 255 karakter.'),

  body('provinsi')
    .notEmpty().withMessage('Provinsi wajib diisi.')
    .trim()
    .isLength({ max: 100 }),

  body('kota')
    .notEmpty().withMessage('Kota wajib diisi.')
    .trim()
    .isLength({ max: 100 }),

  body('kecamatan')
    .notEmpty().withMessage('Kecamatan wajib diisi.')
    .trim()
    .isLength({ max: 100 }),

  body('kelurahan')
    .notEmpty().withMessage('Kelurahan wajib diisi.')
    .trim()
    .isLength({ max: 100 }),

  body('rt')
    .notEmpty().withMessage('RT wajib diisi.')
    .matches(/^\d{1,3}$/).withMessage('RT harus berupa angka 1-3 digit.'),

  body('rw')
    .notEmpty().withMessage('RW wajib diisi.')
    .matches(/^\d{1,3}$/).withMessage('RW harus berupa angka 1-3 digit.'),

  handleValidationErrors,
];

/**
 * Validasi untuk POST /api/surat/tolak/:id (RT/RW menolak surat).
 */
const validateRejectSurat = [
  body('alasan')
    .notEmpty().withMessage('Alasan penolakan wajib diisi.')
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Alasan harus antara 10-500 karakter.'),

  handleValidationErrors,
];

/**
 * Validasi untuk POST /api/surat/offline (RT/RW buat surat untuk warga langsung).
 */
const validateSuratOffline = [
  body('nik_warga')
    .notEmpty().withMessage('NIK warga wajib diisi.')
    .matches(/^\d{16}$/).withMessage('NIK harus tepat 16 digit angka.'),

  body('nama_warga')
    .notEmpty().withMessage('Nama warga wajib diisi.')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Nama warga antara 2-255 karakter.'),

  body('jenis_surat')
    .notEmpty().withMessage('Jenis surat wajib diisi.')
    .trim()
    .isLength({ max: 255 }),

  handleValidationErrors,
];

module.exports = { validateAjukanSurat, validateRejectSurat, validateSuratOffline };

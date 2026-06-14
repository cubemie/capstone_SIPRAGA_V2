/**
 * errorHandler.js  —  Global Express Error Handler
 *
 * Harus didaftarkan TERAKHIR di app.js setelah semua route.
 * Controller melempar error dengan next(err) agar ditangkap di sini.
 *
 * Format response error yang konsisten:
 * {
 *   "message": "Pesan error untuk user",
 *   "detail":  "..." // hanya muncul di NODE_ENV !== 'production'
 * }
 */

const logger = require('../config/logger');

module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Multer error (file terlalu besar, format salah, dll)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file melebihi batas yang diizinkan.' });
  }

  if (err.message && err.message.startsWith('Format file tidak valid')) {
    return res.status(415).json({ message: err.message });
  }

  // Log error secara terstruktur via Winston
  logger.error(`${req.method} ${req.path} — ${err.message || 'Unknown Error'}`, {
    method: req.method,
    path: req.path,
    status: err.status || 500,
    stack: err.stack,
    fullError: err
  });

  // Response ke client
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  const message = err.message && !isProduction ? err.message : 'Terjadi kesalahan pada server.';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(isProduction ? {} : { detail: err.stack }),
  });
};

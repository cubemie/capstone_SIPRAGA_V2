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

module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Multer error (file terlalu besar, format salah, dll)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file melebihi batas yang diizinkan.' });
  }

  if (err.message && err.message.startsWith('Format file tidak valid')) {
    return res.status(415).json({ message: err.message });
  }

  // Log error lengkap di server (tidak dikirim ke client)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  // Response ke client
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: err.message && !isProduction ? err.message : 'Terjadi kesalahan pada server.',
    ...(isProduction ? {} : { detail: err.stack }),
  });
};

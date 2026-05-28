const jwt = require('jsonwebtoken');

/**
 * Ekstrak dan verifikasi JWT dari header Authorization.
 * Digunakan oleh semua middleware auth agar logika token tidak duplikat.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {{ decoded: Object }|null} decoded payload, atau null jika sudah response
 */
function extractAndVerifyToken(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded };
  } catch (err) {
    res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
    return null;
  }
}

/**
 * Middleware untuk memverifikasi JWT token warga (semua role).
 * Token diambil dari header Authorization: Bearer <token>
 * Hasil decode disimpan di req.user.
 */
exports.verifyToken = (req, res, next) => {
  const result = extractAndVerifyToken(req, res);
  if (!result) return; // response sudah dikirim di dalam helper
  req.user = result.decoded;
  next();
};

/**
 * Helper internal — diekspor agar bisa digunakan oleh middleware lain.
 */
exports.extractAndVerifyToken = extractAndVerifyToken;

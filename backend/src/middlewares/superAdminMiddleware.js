const { extractAndVerifyToken } = require('./authMiddleware');

/**
 * Middleware untuk memverifikasi JWT token Superadmin.
 * Payload JWT harus mengandung role: 'superadmin'.
 * Hasil decode disimpan di req.superadmin.
 */
module.exports = (req, res, next) => {
  const result = extractAndVerifyToken(req, res);
  if (!result) return; // response sudah dikirim

  const { decoded } = result;

  if (decoded.role !== 'superadmin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya superadmin yang diizinkan.' });
  }

  req.superadmin = decoded; // { id, username, role }
  next();
};

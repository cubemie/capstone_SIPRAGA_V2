const { extractAndVerifyToken } = require('./authMiddleware');

/**
 * Middleware untuk memverifikasi JWT token RT/RW.
 * Payload JWT harus mengandung role: 'rt' atau 'rw'.
 * Hasil decode disimpan di req.rtRwUser.
 */
const ALLOWED_ROLES = ['rt', 'rw'];

module.exports = (req, res, next) => {
  const result = extractAndVerifyToken(req, res);
  if (!result) return; // response sudah dikirim

  const { decoded } = result;

  if (!ALLOWED_ROLES.includes(decoded.role)) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya RT/RW yang diizinkan.' });
  }

  req.rtRwUser = decoded; // { id, username, role }
  req.user = decoded;
  req.tenantId = decoded.rw_id || decoded.id;
  next();
};

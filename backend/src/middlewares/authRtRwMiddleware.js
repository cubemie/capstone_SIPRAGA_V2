const { extractAndVerifyToken } = require('./authMiddleware');

/**
 * Middleware untuk memverifikasi JWT token RT/RW.
 * Payload JWT harus mengandung role: 'rt' atau 'rw'.
 * Hasil decode disimpan di req.rtRwUser.
 */
const ALLOWED_ROLES = ['rt', 'rw'];

module.exports = (req, res, next) => {
  console.log('[authRtRwMiddleware] Checking request...');
  const result = extractAndVerifyToken(req, res);
  if (!result) {
    console.log('[authRtRwMiddleware] extractAndVerifyToken failed');
    return; // response sudah dikirim
  }

  const { decoded } = result;
  console.log('[authRtRwMiddleware] Decoded token:', decoded);

  if (!ALLOWED_ROLES.includes(decoded.role)) {
    console.log('[authRtRwMiddleware] Role not allowed:', decoded.role);
    return res.status(403).json({ message: 'Akses ditolak. Hanya RT/RW yang diizinkan.' });
  }

  req.rtRwUser = decoded; // { id, username, role }
  req.user = decoded;
  req.tenantId = decoded.rw_id || decoded.id;
  console.log('[authRtRwMiddleware] All good, proceeding...');
  next();
};

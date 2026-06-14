const jwt = require('jsonwebtoken');

// ─── In-memory token blacklist (Opsi A — tanpa Redis) ─────────────────────────
// Cocok untuk capstone/dev. Untuk production, ganti dengan Redis.
// Set ini menyimpan token yang sudah logout agar tidak bisa dipakai lagi.
const tokenBlacklist = new Set();

/**
 * Tambahkan token ke blacklist saat logout.
 * @param {string} token — raw JWT token
 */
function blacklistToken(token) {
  tokenBlacklist.add(token);

  // Auto-cleanup: hapus token dari blacklist setelah expire
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const ttlMs = (decoded.exp * 1000) - Date.now();
      if (ttlMs > 0) {
        setTimeout(() => tokenBlacklist.delete(token), ttlMs);
      }
    }
  } catch (_) { /* abaikan error decode */ }
}

/**
 * Cek apakah token ada di blacklist.
 * @param {string} token
 * @returns {boolean}
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Ekstrak dan verifikasi JWT dari header Authorization.
 * Digunakan oleh semua middleware auth agar logika token tidak duplikat.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {{ decoded: Object, token: string }|null} decoded payload + raw token, atau null jika sudah response
 */
function extractAndVerifyToken(req, res) {
  console.log("[authMiddleware.extractAndVerifyToken] req.headers.authorization:", req.headers['authorization']);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>
  console.log("[authMiddleware.extractAndVerifyToken] token:", token);

  if (!token) {
    console.log("[authMiddleware.extractAndVerifyToken] No token found");
    res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    return null;
  }

  // Cek blacklist sebelum verifikasi signature
  if (isTokenBlacklisted(token)) {
    console.log("[authMiddleware.extractAndVerifyToken] Token is blacklisted");
    res.status(401).json({ message: 'Token tidak valid. Silakan login kembali.' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authMiddleware.extractAndVerifyToken] Decoded token:", decoded);
    return { decoded, token };
  } catch (err) {
    console.log("[authMiddleware.extractAndVerifyToken] Token verify failed:", err.message);
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
  req.tenantId = result.decoded.rw_id || result.decoded.id;
  req.token = result.token; // simpan raw token untuk keperluan logout
  next();
};

/**
 * Helper internal — diekspor agar bisa digunakan oleh middleware lain.
 */
exports.extractAndVerifyToken = extractAndVerifyToken;

/**
 * Fungsi blacklist — diekspor untuk digunakan oleh AuthController.logout.
 */
exports.blacklistToken = blacklistToken;

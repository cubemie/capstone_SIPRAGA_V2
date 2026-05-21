const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT token warga.
 * Token diambil dari header Authorization: Bearer <token>
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id_warga, nama, nik }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

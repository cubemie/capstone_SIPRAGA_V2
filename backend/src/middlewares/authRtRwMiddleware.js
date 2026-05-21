const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT token RT/RW.
 * Token diambil dari header Authorization: Bearer <token>
 * Payload JWT harus mengandung role: 'rt' atau 'rw'
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'rt' && decoded.role !== 'rw') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya RT/RW yang diizinkan.' });
    }

    req.rtRwUser = decoded; // { id, username, role, rt, rw }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

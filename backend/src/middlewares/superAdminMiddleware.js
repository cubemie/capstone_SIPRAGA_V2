const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT token Superadmin.
 * Token diambil dari header Authorization: Bearer <token>
 * Payload JWT harus mengandung role: 'superadmin'
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized: hanya superadmin yang boleh mengakses.' });
    }

    req.superadmin = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

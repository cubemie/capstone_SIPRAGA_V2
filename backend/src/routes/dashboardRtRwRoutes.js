/**
 * dashboardRtRwRoutes.js
 *
 * Endpoint dashboard RT/RW. Sebelumnya menggunakan req.session,
 * sekarang menggunakan req.user dari JWT (via verifyToken).
 */
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/dashboard-rt-rw', verifyToken, (req, res) => {
  const user = req.user;
  res.json({
    message: `Selamat datang ${user.username || user.nama} (${(user.role || '').toUpperCase()})`,
    user,
  });
});

module.exports = router;

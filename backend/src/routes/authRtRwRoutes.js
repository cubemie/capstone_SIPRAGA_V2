/**
 * authRtRwRoutes.js
 *
 * Route ini sekarang hanya menjadi alias — endpoint login RT/RW
 * sudah tersedia di /api/auth/login-rtrw.
 * Dipertahankan untuk kompatibilitas mundur.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login-rt-rw', authController.loginRtRw);

module.exports = router;

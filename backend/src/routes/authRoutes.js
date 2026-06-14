const express      = require('express');
const router       = express.Router();
const rateLimit    = require('express-rate-limit');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * Rate limiter untuk endpoint login — cegah brute force password.
 * Window 15 menit, maks 10 percobaan per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,                   // maks 10 percobaan
  standardHeaders: true,     // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    message: 'Terlalu banyak percobaan login dari IP ini. Coba lagi 15 menit lagi.',
  },
});

router.post('/register', authController.register);
router.post('/register-rw', authController.registerRw);
router.post('/register-rt', authController.registerRt);
router.post('/login',      loginLimiter, authController.loginWarga);
router.post('/login-rtrw', loginLimiter, authController.loginRtRw);
router.post('/logout', authController.logout);
router.get('/check-session', verifyToken, authController.checkSession);

// Profil Terpadu (Semua Role)
const ProfileController = require('../controllers/ProfileController');
const { uploadAvatar } = require('../middlewares/upload');

router.get('/profile', verifyToken, ProfileController.getProfile);
router.put('/profile', verifyToken, uploadAvatar.single('avatar'), ProfileController.updateProfile);

module.exports = router;

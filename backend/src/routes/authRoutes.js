const express      = require('express');
const router       = express.Router();
const rateLimit    = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
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

const { validateRegister, validateRegisterRtRw } = require('../middlewares/validateAuth');

router.post('/register', validateRegister, AuthController.register);
router.post('/register-rw', validateRegisterRtRw, AuthController.registerRw);
router.post('/register-rt', validateRegisterRtRw, AuthController.registerRt);
router.post('/login',      loginLimiter, AuthController.loginWarga);
router.post('/login-rtrw', loginLimiter, AuthController.loginRtRw);
router.post('/logout', AuthController.logout);
router.get('/check-session', verifyToken, AuthController.checkSession);

module.exports = router;

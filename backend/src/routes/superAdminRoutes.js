const express         = require('express');
const router          = express.Router();
const authController  = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const requireSuperadmin = require('../middlewares/superAdminMiddleware');

// Public — register superadmin baru
router.post('/register', authController.registerSuperadmin);

// Public — login superadmin
router.post('/login', authController.loginSuperadmin);

// Protected — hanya superadmin yang bisa insert RT/RW
// verifyToken memvalidasi JWT dulu, requireSuperadmin cek role
router.post('/rt', verifyToken, requireSuperadmin, authController.insertRt);
router.post('/rw', verifyToken, requireSuperadmin, authController.insertRw);

module.exports = router;

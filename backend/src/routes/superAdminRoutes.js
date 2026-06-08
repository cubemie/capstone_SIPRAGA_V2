const express         = require('express');
const router          = express.Router();
const AuthController  = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/authMiddleware');
const requireSuperadmin = require('../middlewares/superAdminMiddleware');

// Public — login superadmin
router.post('/login', AuthController.loginSuperadmin);

// Protected — hanya superadmin yang bisa insert RT/RW
// verifyToken memvalidasi JWT dulu, requireSuperadmin cek role
router.post('/rt', verifyToken, requireSuperadmin, AuthController.insertRt);
router.post('/rw', verifyToken, requireSuperadmin, AuthController.insertRw);

module.exports = router;

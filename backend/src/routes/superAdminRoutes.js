const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const requireSuperadmin = require('../middlewares/superAdminMiddleware');

// Public — login superadmin
router.post('/login', AuthController.loginSuperadmin);

// Protected — hanya superadmin yang bisa insert RT/RW
router.post('/rt', requireSuperadmin, AuthController.insertRt);
router.post('/rw', requireSuperadmin, AuthController.insertRw);

module.exports = router;

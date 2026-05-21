const express = require('express');
const router = express.Router();
const { loginSuperadmin, insertRt, insertRw } = require('../controllers/superAdminController');
const requireSuperadmin = require('../middlewares/superAdminMiddleware');

// Public — login superadmin
router.post('/login', loginSuperadmin);

// Protected — hanya superadmin yang bisa insert RT/RW
router.post('/rt', requireSuperadmin, insertRt);
router.post('/rw', requireSuperadmin, insertRw);

module.exports = router;

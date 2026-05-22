const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.loginWarga);
router.post('/login-rtrw', AuthController.loginRtRw);
router.post('/logout', AuthController.logout);
router.get('/check-session', verifyToken, AuthController.checkSession);

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-session', verifyToken, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

module.exports = router;

// backend/src/routes/notificationRoutes.js
const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const authRtRwMiddleware = require('../middlewares/authRtRwMiddleware');

const router = express.Router();

// Endpoint universal — kedua middleware akan dicoba
// Gunakan middleware wrapper yang accept any valid JWT
const anyAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

router.get('/',                anyAuth, getNotifications);
router.patch('/:id/read',      anyAuth, markAsRead);
router.patch('/read-all',      anyAuth, markAllAsRead);

module.exports = router;
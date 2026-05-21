const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middlewares/authMiddleware');
const { uploadTtd, getTtd } = require('../controllers/ttdController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ttd/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ttd_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format harus JPG/PNG'));
};

const upload = multer({ storage, fileFilter });

// Upload tanda tangan
router.post('/upload-ttd', verifyToken, upload.single('ttdImage'), uploadTtd);

// Ambil tanda tangan saat ini
router.get('/current-ttd', verifyToken, getTtd);

module.exports = router;

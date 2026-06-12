const express           = require('express');
const router            = express.Router();
const { verifyToken }   = require('../middlewares/authMiddleware');
const { uploadTtd }     = require('../middlewares/upload');
const wargaController   = require('../controllers/wargaController');

// Upload tanda tangan digital
router.post('/upload-ttd',  verifyToken, uploadTtd.single('ttdImage'), wargaController.uploadTtd);

// Ambil tanda tangan saat ini
router.get('/current-ttd',  verifyToken, wargaController.getTtd);

module.exports = router;

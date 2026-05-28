const express           = require('express');
const router            = express.Router();
const { verifyToken }   = require('../middlewares/authMiddleware');
const { uploadTtd }     = require('../middlewares/upload');
const WargaController   = require('../controllers/WargaController');

// Upload tanda tangan digital
router.post('/upload-ttd',  verifyToken, uploadTtd.single('ttdImage'), WargaController.uploadTtd);

// Ambil tanda tangan saat ini
router.get('/current-ttd',  verifyToken, WargaController.getTtd);

module.exports = router;

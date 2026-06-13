const express              = require('express');
const router               = express.Router();
const { verifyToken }      = require('../middlewares/authMiddleware');
const authRtRwMiddleware   = require('../middlewares/authRtRwMiddleware');
const { uploadTtd }        = require('../middlewares/upload');
const wargaController      = require('../controllers/wargaController');

// Upload TTD — hanya RT/RW yang boleh upload TTD mereka
router.post('/upload-ttd',  authRtRwMiddleware, uploadTtd.single('ttdImage'), wargaController.uploadTtd);

// Get TTD — RT/RW bisa lihat TTD mereka sendiri
router.get('/current-ttd',  authRtRwMiddleware, wargaController.getTtd);

module.exports = router;

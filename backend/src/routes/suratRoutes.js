const express              = require('express');
const router               = express.Router();
const path                 = require('path');
const fs                   = require('fs');
const { verifyToken }      = require('../middlewares/authMiddleware');
const requireRtRw          = require('../middlewares/authRtRwMiddleware');
const { uploadSurat, uploadSuratSigned } = require('../middlewares/upload');
const suratController      = require('../controllers/suratController');
const {
  validateAjukanSurat,
  validateRejectSurat,
  validateSuratOffline,
} = require('../middlewares/validateSurat');

// ─── Warga ────────────────────────────────────────────────────────────────────
router.post('/ajukan',     verifyToken, validateAjukanSurat, uploadSurat.single('fileSurat'), suratController.ajukanSurat);
router.get('/milik-saya',  verifyToken,                                         suratController.getMySurat);
router.get('/statistik',   verifyToken,                                         suratController.getStatistik);

// ─── RT / RW ──────────────────────────────────────────────────────────────────
router.get('/masuk',                    verifyToken, requireRtRw, suratController.getSuratMasuk);
router.get('/menunggu-ttd',             verifyToken, requireRtRw, suratController.getSuratMenungguTtd);
router.post('/tanda-tangani/:id',       verifyToken, requireRtRw, uploadSuratSigned.single('fileSurat'), suratController.approveSurat);
router.post('/tolak/:id',               verifyToken, requireRtRw, validateRejectSurat, suratController.rejectSurat);
router.get('/riwayat-rtrw',             verifyToken, requireRtRw, suratController.getRiwayat);

// ─── Surat Offline (RT/RW buat surat untuk warga yang datang langsung) ────────
router.post('/offline',                 verifyToken, requireRtRw, validateSuratOffline, suratController.ajukanSuratOffline);

// ─── Download file pengajuan ──────────────────────────────────────────────────
router.get('/download/:filename', verifyToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'surat', filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ message: 'File tidak ditemukan.' });
    res.download(filePath, filename);
  });
});

module.exports = router;

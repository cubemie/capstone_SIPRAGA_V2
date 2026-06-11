const express              = require('express');
const router               = express.Router();
const path                 = require('path');
const fs                   = require('fs');
const { verifyToken }      = require('../middlewares/authMiddleware');
const requireRtRw          = require('../middlewares/authRtRwMiddleware');
const requireSuperadmin    = require('../middlewares/superAdminMiddleware');
const { uploadSurat, uploadSuratSigned } = require('../middlewares/upload');
const SuratController      = require('../controllers/SuratController');
const {
  validateAjukanSurat,
  validateRejectSurat,
  validateSuratOffline,
} = require('../middlewares/validateSurat');

// ─── Warga ────────────────────────────────────────────────────────────────────
router.post('/ajukan',     verifyToken, validateAjukanSurat, uploadSurat.single('fileSurat'), SuratController.ajukanSurat);
router.get('/milik-saya',  verifyToken,                                         SuratController.getMySurat);
router.get('/statistik',   verifyToken,                                         SuratController.getStatistik);

// ─── RT / RW ──────────────────────────────────────────────────────────────────
router.get('/masuk',                    verifyToken, requireRtRw, SuratController.getSuratMasuk);
router.get('/menunggu-ttd',             verifyToken, requireRtRw, SuratController.getSuratMenungguTtd);
router.post('/tanda-tangani/:id',       verifyToken, requireRtRw, uploadSuratSigned.single('fileSurat'), SuratController.approveSurat);
router.post('/tolak/:id',               verifyToken, requireRtRw, validateRejectSurat, SuratController.rejectSurat);
router.get('/riwayat-rtrw',             verifyToken, requireRtRw, SuratController.getRiwayat);

// ─── Surat Offline (RT/RW buat surat untuk warga yang datang langsung) ────────
router.post('/offline',                 verifyToken, requireRtRw, validateSuratOffline, SuratController.ajukanSuratOffline);

// ─── Superadmin ────────────────────────────────────────────────────
router.get('/semua',                    verifyToken, requireSuperadmin, SuratController.getAllSurat);

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

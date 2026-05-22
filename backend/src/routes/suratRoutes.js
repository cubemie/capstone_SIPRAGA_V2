const express              = require('express');
const router               = express.Router();
const path                 = require('path');
const fs                   = require('fs');
const { verifyToken }      = require('../middlewares/authMiddleware');
const { uploadSurat, uploadSuratSigned } = require('../middlewares/upload');
const SuratController      = require('../controllers/SuratController');

// ─── Warga ────────────────────────────────────────────────────────────────────
router.post('/ajukan',     verifyToken, uploadSurat.single('fileSurat'),       SuratController.ajukanSurat);
router.get('/milik-saya',  verifyToken,                                         SuratController.getMySurat);
router.get('/statistik',   verifyToken,                                         SuratController.getStatistik);

// ─── RT / RW ──────────────────────────────────────────────────────────────────
router.get('/masuk',                    verifyToken, SuratController.getSuratMasuk);
router.get('/menunggu-ttd',             verifyToken, SuratController.getSuratMenungguTtd);
router.post('/tanda-tangani/:id',       verifyToken, uploadSuratSigned.single('fileSurat'), SuratController.approveSurat);
router.post('/tolak/:id',               verifyToken, SuratController.rejectSurat);
router.get('/riwayat-rtrw',             verifyToken, SuratController.getRiwayat);

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

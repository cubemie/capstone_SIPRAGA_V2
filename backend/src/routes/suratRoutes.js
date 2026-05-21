const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { ajukanSurat, getSuratMilikSaya, getStatistikSurat, getSuratMenungguTTD, tandaTanganiSurat, tolakSurat, getRiwayatSuratRtRw, uploadTemplateSurat } = require('../controllers/suratController');
const { verifyToken } = require('../middlewares/authMiddleware');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

// Storage untuk template surat
const templateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/templates/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const uploadTemplate = multer({ storage: templateStorage });


const upload = multer({ storage });

router.get('/statistik', verifyToken, getStatistikSurat);

router.post('/ajukan', verifyToken, upload.single('fileSurat'), ajukanSurat);
router.get('/milik-saya', verifyToken, getSuratMilikSaya);

router.get('/download/:filename', verifyToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }
    res.download(filePath, filename);
  });
});

router.get('/menunggu-ttd', verifyToken, getSuratMenungguTTD);
// Tambahkan storage baru untuk signed files di luar controller
const signedStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/signed/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `signed_${Date.now()}${ext}`);
  }
});

const uploadSigned = multer({ storage: signedStorage });

router.post('/tanda-tangani/:id', verifyToken, uploadSigned.single('fileSurat'), tandaTanganiSurat);
router.post('/tolak/:id', verifyToken, tolakSurat);
router.get('/riwayat-rtrw', verifyToken, getRiwayatSuratRtRw);
router.post('/template/upload', verifyToken, uploadTemplate.single('fileTemplate'), uploadTemplateSurat);


module.exports = router;

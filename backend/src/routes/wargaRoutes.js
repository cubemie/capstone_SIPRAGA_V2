const express           = require('express');
const router            = express.Router();
const { verifyToken }   = require('../middlewares/authMiddleware');
const { uploadKtp }     = require('../middlewares/upload');
const WargaController   = require('../controllers/WargaController');

router.get('/profil',           verifyToken, WargaController.getProfile);
router.get('/kelengkapan-data', verifyToken, WargaController.getKelengkapan);
router.put('/lengkapi-data',    verifyToken, uploadKtp.single('foto_ktp'), WargaController.lengkapiData);

module.exports = router;

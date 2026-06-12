const express           = require('express');
const router            = express.Router();
const { verifyToken }   = require('../middlewares/authMiddleware');
const { uploadKtp }     = require('../middlewares/upload');
const wargaController   = require('../controllers/wargaController');

router.get('/profil',           verifyToken, wargaController.getProfile);
router.get('/kelengkapan-data', verifyToken, wargaController.getKelengkapan);
router.put('/lengkapi-data',    verifyToken, uploadKtp.single('foto_ktp'), wargaController.lengkapiData);

module.exports = router;

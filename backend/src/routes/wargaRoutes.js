const express           = require('express');
const router            = express.Router();
const { verifyToken }   = require('../middlewares/authMiddleware');
const { uploadKtp }     = require('../middlewares/upload');
const wargaController   = require('../controllers/wargaController');
const ProfileController = require('../controllers/ProfileController');

router.get('/profil',           verifyToken, wargaController.getProfile);
router.get('/kelengkapan-data', verifyToken, wargaController.getKelengkapan);
router.put('/lengkapi-data',    verifyToken, uploadKtp.single('foto_ktp'), wargaController.lengkapiData);

router.get('/profile', verifyToken, ProfileController.getProfile);
router.put('/profile', verifyToken, ProfileController.updateProfile);

module.exports = router;

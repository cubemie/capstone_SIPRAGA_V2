const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

const { getKelengkapanData } = require('../controllers/wargaController'); // atau ganti ke wargaController kalau dipisah
router.get('/kelengkapan-data', verifyToken, getKelengkapanData);

module.exports = router;

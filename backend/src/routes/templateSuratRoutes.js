const express                    = require('express');
const router                     = express.Router();
const { verifyToken }            = require('../middlewares/authMiddleware');
const requireSuperadmin          = require('../middlewares/superAdminMiddleware');
const { uploadTemplate }         = require('../middlewares/upload');
const TemplateSuratController    = require('../controllers/TemplateSuratController');

// GET semua template — PUBLIC (warga butuh ini saat ajukan surat)
router.get('/', TemplateSuratController.getAll);

// POST upload template baru — SUPERADMIN ONLY (verifyToken wajib sebelum role check)
router.post(
  '/',
  verifyToken,
  requireSuperadmin,
  uploadTemplate.single('file'),
  TemplateSuratController.upload
);

// DELETE template berdasarkan ID — SUPERADMIN ONLY
router.delete('/:id', verifyToken, requireSuperadmin, TemplateSuratController.deleteById);

// GET download template — perlu login minimal
router.get('/:id/download', verifyToken, TemplateSuratController.download);

module.exports = router;

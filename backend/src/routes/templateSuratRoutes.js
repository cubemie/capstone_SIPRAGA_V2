const express                    = require('express');
const router                     = express.Router();
const { uploadTemplate }         = require('../middlewares/upload');
const TemplateSuratController    = require('../controllers/TemplateSuratController');

// GET semua template
router.get('/',           TemplateSuratController.getAll);

// POST upload template baru
router.post('/',          uploadTemplate.single('file'), TemplateSuratController.upload);

// DELETE template berdasarkan ID
router.delete('/:id',     TemplateSuratController.deleteById);

// GET download template
router.get('/:id/download', TemplateSuratController.download);

module.exports = router;

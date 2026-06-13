const express = require('express');
const LettersController = require('./letters.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');
const authRtRwMiddleware = require('../../middlewares/authRtRwMiddleware');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.tenantId = decoded.rw_id || decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

// ── Public routes (tanpa auth) ─────────────────────────────────────────────
router.get('/types', LettersController.getLetterTypes);
router.get('/types/:typeId/fields', LettersController.getTemplateFields);
router.get('/workflows', LettersController.getWorkflowOptions);
router.get('/verify/:qrToken', LettersController.verifyByQrToken);

// ── RT/RW only routes ──────────────────────────────────────────────────────
router.get('/inbox', authRtRwMiddleware, LettersController.getInbox);
router.post('/:uuid/approve', authRtRwMiddleware, LettersController.approveLetter);
router.post('/:uuid/reject', authRtRwMiddleware, LettersController.rejectLetter);

// ── Warga only routes ──────────────────────────────────────────────────────
router.post('/drafts', verifyToken, LettersController.createDraft);
router.post('/:uuid/submit', verifyToken, LettersController.submitLetter);
router.post('/:uuid/upload-pdf', verifyToken, upload.single('pdf'), LettersController.uploadPdfClient);
router.post('/:uuid/attachments', verifyToken, upload.array('attachments', 10), LettersController.uploadAttachments);

// ── Shared routes (warga + RT/RW) ──────────────────────────────────────────
router.get('/', verifyToken, LettersController.getMyLetters);
router.get('/:uuid', flexibleAuth, LettersController.getLetterDetail);
router.get('/:uuid/preview-pdf', flexibleAuth, LettersController.getPreviewPdf);

module.exports = router;

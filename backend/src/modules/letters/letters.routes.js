const express = require('express');
const LettersController = require('./letters.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');
const authRtRwMiddleware = require('../../middlewares/authRtRwMiddleware');

const router = express.Router();

router.get('/inbox', authRtRwMiddleware, LettersController.getInbox);


// Get Reference Data
router.get('/types', LettersController.getLetterTypes);
router.get('/types/:typeId/fields', LettersController.getTemplateFields);
router.get('/workflows', LettersController.getWorkflowOptions);

router.get('/verify/:qrToken', LettersController.verifyByQrToken);

// Letter Operations
router.use(verifyToken); // Protect routes below
router.get('/', LettersController.getMyLetters);
router.get('', LettersController.getMyLetters);
router.post('/drafts', LettersController.createDraft);
router.get('/:uuid', LettersController.getLetterDetail);
router.post('/:uuid/submit', LettersController.submitLetter);
router.get('/:uuid/preview-pdf', LettersController.getPreviewPdf);

// Approvals
router.post('/:uuid/approve', LettersController.approveLetter);
router.post('/:uuid/reject', LettersController.rejectLetter);

module.exports = router;

const express = require('express');
const LettersController = require('./letters.controller');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Get Reference Data
router.get('/types', LettersController.getLetterTypes);
router.get('/types/:typeId/fields', LettersController.getTemplateFields);
router.get('/workflows', LettersController.getWorkflowOptions);

// Letter Operations
router.use(verifyToken); // Protect routes below
router.get('/', LettersController.getMyLetters);
router.get('', LettersController.getMyLetters);
router.post('/drafts', LettersController.createDraft);
router.get('/:uuid', LettersController.getLetterDetail);
router.post('/:uuid/submit', LettersController.submitLetter);

// Approvals
router.post('/:uuid/approve', LettersController.approveLetter);
router.post('/:uuid/reject', LettersController.rejectLetter);

module.exports = router;

const express = require('express');
const PublicController = require('./public.controller');

const router = express.Router();

router.get('/letters/:uuid/verify', PublicController.verifyLetter);

module.exports = router;

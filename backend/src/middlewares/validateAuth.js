const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validateRegister = [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }
    next();
  }
];

const validateRegisterRtRw = [
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateRegisterRtRw
};

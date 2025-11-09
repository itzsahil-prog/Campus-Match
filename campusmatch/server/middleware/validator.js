const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => err.msg)
      }
    });
  }
  next();
};

// Signup validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  validate
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Profile validation rules
const profileValidation = [
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  validate
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  profileValidation
};

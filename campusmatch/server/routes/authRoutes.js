const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/verify-email', verifyEmail);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getMe,
  getUserProfile,
  updateProfile,
  updateSettings,
  deleteAccount,
  uploadPhoto,
  deletePhoto
} = require('../controllers/userController');
const { protect, requireVerified } = require('../middleware/auth');
const { profileValidation } = require('../middleware/validator');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/me', getMe);
router.get('/profile/:id', requireVerified, getUserProfile);
router.put('/profile', requireVerified, profileValidation, updateProfile);

// Photo routes
router.post('/profile/photo', requireVerified, upload.single('photo'), uploadPhoto);
router.delete('/profile/photo/:index', requireVerified, deletePhoto);

// Settings routes
router.put('/settings', updateSettings);

// Account management
router.delete('/account', deleteAccount);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getSuggestions,
  swipe,
  getMatches,
  unmatch
} = require('../controllers/matchController');
const { protect, requireVerified } = require('../middleware/auth');

// All routes require authentication and verification
router.use(protect, requireVerified);

router.get('/suggestions', getSuggestions);
router.post('/swipe', swipe);
router.get('/matches', getMatches);
router.delete('/match/:id', unmatch);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const mediaController = require('../controllers/mediaController');

// GET /api/users/:userId - Fetches a user's profile data
router.get('/:userId', userController.getUserProfile);

// GET /api/users/:userId/media - Fetches all media for a specific user
router.get('/:userId/media', mediaController.getMediaByUserId);

module.exports = router;
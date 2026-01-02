const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get media_id
const ratingsController = require('../controllers/ratingsController');
const { protect } = require('../middleware/authMiddleware');

// The media_id will be in the URL, e.g., /media/:media_id/ratings
router.post(
    '/',
    protect,
    ratingsController.rateMedia
);

module.exports = router;

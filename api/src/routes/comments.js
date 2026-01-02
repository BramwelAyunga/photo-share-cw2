const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get media_id
const commentsController = require('../controllers/commentsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// The media_id will be in the URL, e.g., /media/:media_id/comments
router.post(
    '/',
    protect,
    commentsController.createComment
);

router.get(
    '/',
    commentsController.getComments
);

router.delete(
    '/:comment_id',
    protect,
    commentsController.deleteComment
);

module.exports = router;

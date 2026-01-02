const commentsService = require('../services/commentsService');

const createComment = async (req, res) => {
    try {
        const { media_id } = req.params;
        const { comment, parent_comment_id } = req.body;
        const user_id = req.user.id;

        const newComment = await commentsService.createComment({
            media_id,
            user_id,
            comment,
            parent_comment_id
        });

        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { media_id } = req.params;
        const comments = await commentsService.getComments(media_id);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        await commentsService.deleteComment(comment_id, user_id, user_role);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Comment not found' || error.message === 'User not authorized to delete this comment') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComment,
    getComments,
    deleteComment
};

const commentsRepository = require('../repositories/commentsRepository');
const mediaRepository = require('../repositories/mediaRepository');

const createComment = async (commentData) => {
    const { media_id } = commentData;
    const media = await mediaRepository.getMediaById(media_id);
    if (!media) {
        throw new Error('Media not found.');
    }
    return await commentsRepository.createComment(commentData);
};

const getComments = async (mediaId) => {
    const comments = await commentsRepository.getCommentsByMediaId(mediaId);
    // Simple nesting logic
    const commentMap = {};
    const nestedComments = [];

    // First pass: map all comments by their ID
    comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
    });

    // Second pass: nest replies under their parents
    comments.forEach(comment => {
        if (comment.parent_comment_id) {
            const parent = commentMap[comment.parent_comment_id];
            if (parent) {
                parent.replies.push(comment);
            } else {
                // In case parent is not in the list (e.g. deleted, though we handle that in DB)
                nestedComments.push(comment);
            }
        } else {
            nestedComments.push(comment);
        }
    });

    return nestedComments;
};

const deleteComment = async (commentId, userId, userRole) => {
    const comment = await commentsRepository.getCommentById(commentId);
    if (!comment) {
        throw new Error('Comment not found');
    }

    const media = await mediaRepository.getMediaById(comment.media_id);

    // User can delete their own comment
    if (comment.user_id === userId) {
        return await commentsRepository.deleteComment(commentId);
    }

    // Creator of the media can delete any comment on their media
    if (userRole === 'creator' && media && media.user_id === userId) {
        return await commentsRepository.deleteComment(commentId);
    }

    throw new Error('User not authorized to delete this comment');
};

module.exports = {
    createComment,
    getComments,
    deleteComment
};

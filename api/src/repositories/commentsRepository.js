const pool = require('../config/database');

const createComment = async (commentData) => {
    const { media_id, user_id, comment, parent_comment_id } = commentData;
    const [result] = await pool.query(
        'INSERT INTO comments (media_id, user_id, text, parent_comment_id) VALUES (?, ?, ?, ?)',
        [media_id, user_id, comment, parent_comment_id]
    );
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    return rows[0];
};

const getCommentById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0];
};

const getCommentsByMediaId = async (mediaId) => {
    const [rows] = await pool.query(`
        SELECT c.*, u.name 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.media_id = ?
        ORDER BY c.created_at ASC
    `, [mediaId]);
    return rows;
};

const deleteComment = async (id) => {
    // Instead of deleting, we could mark as deleted to preserve replies.
    // For simplicity here, we will delete. The schema should have ON DELETE CASCADE for replies.
    // The schema in schema.sql has ON DELETE CASCADE for parent_comment_id.
    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
};

module.exports = {
    createComment,
    getCommentById,
    getCommentsByMediaId,
    deleteComment
};

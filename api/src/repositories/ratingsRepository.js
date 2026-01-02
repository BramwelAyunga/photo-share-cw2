const pool = require('../config/database');

const findRatingByUserAndMedia = async (userId, mediaId) => {
    const [rows] = await pool.query(
        'SELECT * FROM ratings WHERE user_id = ? AND media_id = ?',
        [userId, mediaId]
    );
    return rows[0];
};

const createRating = async (ratingData) => {
    const { media_id, user_id, rating } = ratingData;
    const [result] = await pool.query(
        'INSERT INTO ratings (media_id, user_id, rating) VALUES (?, ?, ?)',
        [media_id, user_id, rating]
    );
    const [rows] = await pool.query('SELECT * FROM ratings WHERE id = ?', [result.insertId]);
    return rows[0];
};

const updateRating = async (ratingId, rating) => {
    await pool.query('UPDATE ratings SET rating = ? WHERE id = ?', [rating, ratingId]);
    const [rows] = await pool.query('SELECT * FROM ratings WHERE id = ?', [ratingId]);
    return rows[0];
};

module.exports = {
    findRatingByUserAndMedia,
    createRating,
    updateRating
};

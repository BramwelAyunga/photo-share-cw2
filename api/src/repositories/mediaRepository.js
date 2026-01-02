const pool = require('../config/database');

const createMedia = async (media) => {
    const [result] = await pool.query('INSERT INTO media SET ?', [media]);
    const [rows] = await pool.query('SELECT * FROM media WHERE id = ?', [result.insertId]);
    return rows[0];
};

const getMediaById = async (id) => {
    const [rows] = await pool.query(`
        SELECT m.*, u.name as creator_name, AVG(r.rating) as average_rating, COUNT(c.id) as comment_count
        FROM media m
        JOIN users u ON m.creator_id = u.id
        LEFT JOIN ratings r ON m.id = r.media_id
        LEFT JOIN comments c ON m.id = c.media_id
        WHERE m.id = ? AND m.is_public = 1
        GROUP BY m.id
    `, [id]);
    
    return rows[0];
};

const getPublicMedia = async ({ page = 1, limit = 10, filter, search }) => {
    let query = `
        SELECT m.id, m.creator_id, m.blob_url,m.created_at, m.title, m.thumbnail_blob_url, u.name as creator_name, 
               AVG(r.rating) as average_rating, COUNT(DISTINCT c.id) as comment_count
        FROM media m
        JOIN users u ON m.creator_id = u.id
        LEFT JOIN ratings r ON m.id = r.media_id
        LEFT JOIN comments c ON m.id = c.media_id
        WHERE m.is_public = 1
    `;
    const params = [];

    if (search) {
        query += ` AND (m.title LIKE ? OR m.caption LIKE ? OR u.name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY m.id`;

    if (filter === 'rating') {
        query += ` ORDER BY average_rating DESC`;
    } else { // 'most_recent' is default
        query += ` ORDER BY m.created_at DESC`;
    }

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    return rows;
};


const updateMedia = async (id, data) => {
    await pool.query('UPDATE media SET ? WHERE id = ?', [data, id]);
    const [rows] = await pool.query('SELECT * FROM media WHERE id = ?', [id]);
    return rows[0];
};

const deleteMedia = async (id) => {
    await pool.query('DELETE FROM media WHERE id = ?', [id]);
};

module.exports = {
    createMedia,
    getMediaById,
    getPublicMedia,
    updateMedia,
    deleteMedia,
};

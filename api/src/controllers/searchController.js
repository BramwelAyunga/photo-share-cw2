const db = require('../config/database');

const searchMedia = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        if (!q || q.trim() === '') {
            // If no search query is provided, return all public media.
            const [media] = await db.query('SELECT * FROM media WHERE is_public = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
            return res.json(media);
        }

        // Perform a case-insensitive search on creator_name, title, and caption
        const query = `
            SELECT m.id, m.creator_id, u.name AS creator_name, m.title, m.caption, m.blob_url, m.thumbnail_blob_url, m.created_at,
                   (SELECT COUNT(*) FROM comments WHERE media_id = m.id) AS comment_count,
                   (SELECT AVG(rating) FROM ratings WHERE media_id = m.id) AS average_rating
           FROM media m
            JOIN users u ON m.creator_id = u.id
            WHERE m.is_public = 1
            AND (
                u.name LIKE ?
                OR m.title LIKE ?
                OR m.caption LIKE ?
            )
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const searchTerm = `%${q}%`;
        const [media] = await db.query(query, [searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)]);

        res.json(media);
    } catch (error) {
        console.error('Error searching media:', error);
        res.status(500).json({ message: 'Error searching media', error: error.message });
    }
};

module.exports = { searchMedia };
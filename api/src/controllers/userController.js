const db = require('../config/database');

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const [users] = await db.query('SELECT id, name, role FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};

module.exports = { getUserProfile };
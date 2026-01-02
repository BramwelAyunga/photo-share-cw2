const pool = require('../config/database');

const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const findUserById = async (id) => {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
};

const createUser = async (user) => {
    const { email, password, username, role } = user;
    const [result] = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, password, username, role]
    );
    return { id: result.insertId, ...user };
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser
};

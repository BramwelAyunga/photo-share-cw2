const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const register = async (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
        const [rows] = await pool.query('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [result.insertId]);
        const user = rows[0];
        req.session.user = user; // Create session
        res.status(201).json({ user });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            const userSessionData = { id: user.id, email: user.email, name: user.name, role: user.role };
            req.session.user = userSessionData; // Create session
            res.status(200).json({ user: userSessionData });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid'); // The cookie name may vary based on session config
        res.status(200).json({ message: 'Logged out successfully.' });
    });
};

const getMe = (req, res) => {
    console.log("req.session.user", req.session.user)
    res.status(200).json({ user: req.session.user || null });
};

module.exports = { register, login, logout, getMe };
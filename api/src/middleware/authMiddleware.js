/**
 * Middleware to protect routes that require authentication.
 * It checks for a user object in the session.
 */
const protect = (req, res, next) => {
    if (req.session && req.session.user) {
        // The user is authenticated, attach user info to the request object
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, please log in' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };

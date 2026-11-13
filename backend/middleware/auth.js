const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flight_booking_jwt_secret_key_2026';

const verifyToken = (req, res, next) => {
    if (req.user) {
        return next();
    }

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing.' });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ message: 'Invalid authorization format. Expected Bearer <token>.' });
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.', error: err.message });
    }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.JWT_SECRET = JWT_SECRET;

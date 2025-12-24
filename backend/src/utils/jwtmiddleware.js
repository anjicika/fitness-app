// backend/src/utils/jwtmiddleware.js
const { verifyToken } = require('./jwt');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Vzamemo samo token del

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = payload;

    next();
}

module.exports = authenticate;

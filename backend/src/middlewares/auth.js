const jwt = require('jsonwebtoken');
const config = require('../config');
const UserRepository = require('../repositories/UserRepository');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await UserRepository.findById(decoded.id);
        
        if (!user) {
            return res.status(403).json({ message: 'Invalid token: user not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }
        next();
    };
};


module.exports = {
    authenticateToken,
    authorizeRoles,
};

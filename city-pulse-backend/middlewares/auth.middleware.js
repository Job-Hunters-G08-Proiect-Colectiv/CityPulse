const jwt = require('jsonwebtoken');

// check if logged in
const authenticateToken = (req, res, next) => {
    // token is sent in format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Authentication token required' }); // unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' }); // forbidden
        }
        // attach user id and user type to 'req'
        req.user = user; 
        
        next(); // go to controller
    });
};

// check if admin
const isAdmin = (req, res, next) => {
    if (req.user.type !== 'ADMIN') {
        return res.status(403).json({ error: 'Cannot access. This feature requires admin role' });
    }
    next(); 
};

module.exports = {
    authenticateToken,
    isAdmin
};
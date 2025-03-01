const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;  // Get token from cookies

    if (!token) {
        req.flash('error', 'Access denied. Please log in.');
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user info to request

        // ✅ Store user in `res.locals` to access in EJS templates
        res.locals.user = req.user;

        console.log("🔑 Decoded User:", req.user); // Debugging

        next();
    } catch (err) {
        req.flash('error', 'Invalid or expired token.');
        res.redirect('/auth/login');
    }
};

exports.verifyAdmin = (req, res, next) => {
    this.verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            req.flash('error', 'Access denied.');
            return res.redirect('/');
        }
        next();
    });
};



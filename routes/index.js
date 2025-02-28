const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');


// Home Route
router.get('/', (req, res) => {
    res.render('index', { message: req.flash('success') });
});

router.get('/user/dashboard', verifyToken, (req, res) => {
    res.render('user_dashboard', { user: req.user });
});

// Admin Dashboard (Admin-Only)
router.get('/admin/dashboard', verifyAdmin, (req, res) => {
    res.render('admin_dashboard', { user: req.user });
});

module.exports = router;

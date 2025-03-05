const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');


// Home Route
router.get('/', (req, res) => {
    res.render('index', { message: req.flash('success') });
});

module.exports = router;

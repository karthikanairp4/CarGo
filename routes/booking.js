const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

router.get('/my-bookings', verifyToken, bookingController.getUserBookings);

module.exports = router;

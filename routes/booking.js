const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

router.get('/my-bookings', verifyToken, bookingController.getUserBookings);
router.get('/bookings/edit/:booking_id', verifyToken, bookingController.editBookingPage);
router.post('/bookings/edit/:booking_id', verifyToken, bookingController.updateBooking);
router.get('/bookings/cancel/:booking_id', verifyToken, bookingController.cancelBooking);

module.exports = router;

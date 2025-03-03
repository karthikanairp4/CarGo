const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

router.get('/my-bookings', verifyToken, bookingController.getUserBookings);
// router.get("/edit/:booking_id", verifyToken, bookingController.showEditBookingPage);

// ✅ Route to show cancel confirmation page
// router.get("/cancel/:booking_id", verifyToken, bookingController.showCancelBookingPage);


router.post("/request-edit", verifyToken, bookingController.requestBookingEdit);
router.post("/request-cancel", verifyToken, bookingController.requestBookingCancel);

module.exports = router;

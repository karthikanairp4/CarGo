const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/list', carController.listAvailableCars);

router.get('/book/:car_id', carController.showBookingPage);

// Route to handle booking form submission
// router.post('/book/:id', carController.processBooking);


module.exports = router;

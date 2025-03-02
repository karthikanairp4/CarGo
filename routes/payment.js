const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent',verifyToken, paymentController.createPaymentIntent);

router.post('/checkout', verifyToken, paymentController.showPaymentPage);
router.get('/checkout', verifyToken, paymentController.showPaymentPageToComplete);
router.post('/process', verifyToken,paymentController.processPayment);
router.post('/confirm', verifyToken, paymentController.confirmPayment);
router.get('/success', (req, res) => {
    res.render('paymentSuccess', { title: "Payment Successful" });
});

router.get('/failure', (req, res) => {
    res.render('paymentFailure', { title: "Payment Failed" });
});


module.exports = router;

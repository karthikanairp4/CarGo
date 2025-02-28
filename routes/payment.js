const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent', paymentController.createPaymentIntent);

router.post('/checkout', paymentController.showPaymentPage);
router.post('/process', paymentController.processPayment);

router.get('/success', (req, res) => {
    res.render('paymentSuccess', { title: "Payment Successful" });
});

router.get('/failure', (req, res) => {
    res.render('paymentFailure', { title: "Payment Failed" });
});


module.exports = router;

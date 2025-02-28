// const { Car , Card} = require('../models');
const Car = require('../models/Car');

const Booking = require('../models/Booking');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.processPayment = async (req, res) => {
    try {
        const { car_id, user_id, total_price, start_date, end_date, card_number, expiry_date, cvv } = req.body;

        // Simulate payment with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_price * 100, // Convert to cents
            currency: 'usd',
            payment_method_types: ['card'],
            description: `Payment for Car ID: ${car_id}`,
        });

        console.log("Payment Intent Created:", paymentIntent);

        // Redirect to success page
        res.redirect('/payment/success');
    } catch (err) {
        console.error("Payment Failed:", err);
        res.redirect('/payment/failure');
    }
};
exports.showPaymentPage = async (req, res) => {
    try {
        const { car_id, user_id, total_price, start_date, end_date } = req.body;
        const car = await Car.findByPk(car_id);

        if (!car) {
            return res.status(404).send("Car not found");
        }

        res.render('payment', { 
            title: "Payment | Car Rental", 
            car, 
            user_id, 
            total_price, 
            start_date, 
            end_date 
        });
    } catch (err) {
        console.error("Error loading payment page:", err);
        res.status(500).send("Server error");
    }
};



exports.createPaymentIntent = async (req, res) => {
    try {
        const { total_price, zip } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_price * 100, // Convert to cents
            currency: 'usd',
            payment_method_types: ['card'],
            setup_future_usage: 'off_session', // Enforces full validation
            payment_method_options: {
                card: {
                    request_three_d_secure: "any", // Forces 3D Secure authentication
                },
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error("Stripe Payment Error:", err);
        res.status(500).json({ error: err.message });
    }
};




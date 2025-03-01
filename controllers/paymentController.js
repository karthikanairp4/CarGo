// const { Car , Card} = require('../models');
const Car = require('../models/Car');

const Booking = require('../models/Booking');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Payment = require('../models/Payment');

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
// exports.showPaymentPage = async (req, res) => {
//     try {
//         const { car_id, user_id, total_price, start_date, end_date } = req.body;
//         const car = await Car.findByPk(car_id);
//         console.log(req.body);

//         if (!car) {
//             return res.status(404).send("Car not found");
//         }

//         console.log("✅ Booking Created:", booking.toJSON());
        
//         res.render('payment', { 
//             title: "Payment | Car Rental", 
//             car, 
//             user_id, 
//             total_price, 
//             start_date, 
//             end_date 
//         });
//     } catch (err) {
//         console.error("Error loading payment page:", err);
//         res.status(500).send("Server error");
//     }
// };

exports.showPaymentPage = async (req, res) => {
    try {
        const { car_id, total_price, start_date, end_date } = req.body;

        // ✅ Ensure `user_id` comes from `req.user`
        const user_id = req.user ? req.user.id : null;

        console.log("🔍 Received Data:", { car_id, user_id, total_price, start_date, end_date });

        if (!user_id) {
            console.error("❌ Missing user_id in request.");
            return res.status(400).send("User ID is required.");
        }

        const car = await Car.findByPk(car_id);
        if (!car) {
            return res.status(404).send("Car not found");
        }

        // ✅ Create booking with status "Pending"
        const booking = await Booking.create({
            user_id,
            car_id,
            start_date,
            end_date,
            total_price,
            status: 'Pending'
        });

        console.log("✅ Booking Created:", booking);
        
        console.log("✅ Booking Created:", booking.toJSON(), booking.id);

        res.render('payment', { 
            title: "Payment | CarGo", 
            car, 
            user_id, 
            total_price, 
            start_date, 
            end_date, 
            booking_id: booking.id 
        });
    } catch (err) {
        console.error("❌ Error loading payment page:", err);
        res.status(500).send("Server error");
    }
};



exports.createPaymentIntent = async (req, res) => {
    try {
        const { booking_id, total_price, zip } = req.body;

        console.log("🔍 Received Payment Data:", { booking_id, total_price, zip });

        if (!booking_id) {
            console.error("❌ Missing booking_id.");
            return res.status(400).json({ error: "Booking ID is required." });
        }

        // Check if booking exists
        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            console.error("❌ Booking not found.");
            return res.status(404).json({ error: "Booking not found." });
        }

        // ✅ Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_price * 100, // Convert to cents
            currency: 'usd',
            payment_method_types: ['card'],
            setup_future_usage: 'off_session',
            payment_method_options: {
                card: {
                    request_three_d_secure: "any", // Forces 3D Secure authentication
                },
            },
        });

        // ✅ Save Payment to Database
        const payment = await Payment.create({
            booking_id: booking.id,
            user_id: booking.user_id,
            amount: total_price,
            payment_status: 'Pending', // Will update after confirmation
            transaction_id: paymentIntent.id
        });

        console.log("✅ Payment Record Created:", payment);

        res.json({ clientSecret: paymentIntent.client_secret, payment_id: payment.id });
    } catch (err) {
        console.error("❌ Stripe Payment Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        console.log(req.body+"Reuest Body");

        console.log("🔍 Confirming Payment:", paymentIntentId);

        // Retrieve the payment record
        const payment = await Payment.findOne({ where: { id: paymentIntentId } });

        if (!payment) {
            console.error("❌ Payment not found.");
            return res.status(404).json({ error: "Payment not found." });
        }

        // ✅ Update payment status
        payment.payment_status = 'Paid';
        await payment.save();

        console.log("✅ Payment Marked as Paid:", payment);

        // ✅ Update booking status to "Confirmed"
        const booking = await Booking.findByPk(payment.booking_id);
        if (!booking) {
            console.error("❌ Booking not found.");
            return res.status(404).json({ error: "Booking not found." });
        }

        booking.status = 'Confirmed';
        await booking.save();

        console.log("✅ Booking Confirmed:", booking);

        res.json({ message: "Payment successful and booking confirmed!" });
    } catch (error) {
        console.error("❌ Payment Confirmation Error:", error);
        res.status(500).json({ error: "Error confirming payment" });
    }
};





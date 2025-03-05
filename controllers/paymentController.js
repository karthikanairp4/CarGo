// const { Car , Card} = require('../models');
const Car = require('../models/Car');

const Booking = require('../models/Booking');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Payment = require('../models/Payment');

// exports.processPayment = async (req, res) => {
//     try {
//         const { car_id, user_id, total_price, start_date, end_date, card_number, expiry_date, cvv } = req.body;

//         // Simulate payment with Stripe
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: total_price * 100, // Convert to cents
//             currency: 'usd',
//             payment_method_types: ['card'],
//             description: `Payment for Car ID: ${car_id}`,
//         });

//         console.log("Payment Intent Created:", paymentIntent);

//         // Redirect to success page
//         res.redirect('/payment/success');
//     } catch (err) {
//         console.error("Payment Failed:", err);
//         res.redirect('/payment/failure');
//     }
// };

//for populating booking table
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

        if (car.availability <= 0) {
            console.error("❌ Car is not available.");
            return res.status(400).send("Car is not available for booking.");
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

//Booking page to payment page
exports.showPaymentPageToComplete = async (req, res) => {
    
    try {
        const { booking_id } = req.query;

        console.log("🔍 Received Booking ID:", booking_id);

        if (!booking_id) {
            console.error("❌ Missing booking ID in request.");
            return res.status(400).send("Booking ID is required.");
        }

        // ✅ Fetch Booking Details Including Car Information
        const booking = await Booking.findByPk(booking_id, {
            include: Car // This will automatically fetch the car details
        });

        if (!booking) {
            console.error("❌ Booking not found.");
            return res.status(404).send("Booking not found.");
        }

        console.log("✅ Booking Found:", booking.toJSON());

        // ✅ Fetch Payment Record for This Booking
        let payment = await Payment.findOne({ where: { booking_id } });

        if (!payment) {
            // If no payment exists, create a pending record
            payment = await Payment.create({
                booking_id: booking.id,
                user_id: booking.user_id,
                amount: booking.total_price,
                payment_status: 'pending',
            });
        }

        console.log("✅ Payment Record:", payment.toJSON());

        res.render('payment', { 
            title: "Complete Payment | CarGo", 
            car: booking.Car, 
            user_id: booking.user_id,
            total_price: booking.total_price,
            start_date: booking.start_date,
            end_date: booking.end_date,
            booking_id: booking.id,
            payment_id: payment.id
        });

    } catch (error) {
        console.error("❌ Error loading payment page:", error);
        res.status(500).send("Error loading payment page.");
    }
};


exports.createPaymentIntent = async (req, res) => {
    try {
        const { booking_id, total_price, zip } = req.body;

        console.log("🔍 Received Payment Data:", { booking_id, total_price, zip });

        if (!booking_id || !total_price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 🔍 Check if a payment record already exists for this booking
        let payment = await Payment.findOne({ where: { booking_id } });

        if (payment) {
            console.log("🔄 Updating existing payment record:", payment.id);
        } else {
            console.log("🆕 Creating a new payment record");
            payment = await Payment.create({
                booking_id,
                user_id: req.user.id,
                amount: total_price,
                payment_status: 'pending',
            });
        }

        // ✅ Create a new Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_price * 100, // Convert to cents
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: { booking_id: booking_id }
        });

        // ✅ Update transaction ID in database
        payment.transaction_id = paymentIntent.id;
        await payment.save();

        console.log("✅ Payment Intent Created:", paymentIntent.id);

        res.json({ clientSecret: paymentIntent.client_secret, payment_id: payment.id });
    } catch (err) {
        console.error("❌ Stripe Payment Error:", err);
        res.status(500).json({ error: err.message });
    }
};

//     try {
//         const { paymentIntentId } = req.body;
//         console.log(req.body+"Reuest Body");

//         console.log("🔍 Confirming Payment:", paymentIntentId);

//         // Retrieve the payment record
//         const payment = await Payment.findOne({ where: { id: paymentIntentId } });

//         if (!payment) {
//             console.error("❌ Payment not found.");
//             return res.status(404).json({ error: "Payment not found." });
//         }

//         // ✅ Update payment status
//         payment.payment_status = 'Paid';
//         await payment.save();

//         console.log("✅ Payment Marked as Paid:", payment);

//         // ✅ Update booking status to "Confirmed"
//         const booking = await Booking.findByPk(payment.booking_id);
//         if (!booking) {
//             console.error("❌ Booking not found.");
//             return res.status(404).json({ error: "Booking not found." });
//         }

//         booking.status = 'Confirmed';
//         await booking.save();

//         console.log("✅ Booking Confirmed:", booking);

//         res.json({ message: "Payment successful and booking confirmed!" });
//     } catch (error) {
//         console.error("❌ Payment Confirmation Error:", error);
//         res.status(500).json({ error: "Error confirming payment" });
//     }
// };

// exports.confirmPayment = async (req, res) => {
//     try {
//         const { paymentIntentId } = req.body;

//         console.log("🔍 Confirming Payment:", paymentIntentId);

//         // Retrieve payment from database
//         const payment = await Payment.findOne({ where: { id: paymentIntentId } });

//         if (!payment) {
//             console.error("❌ Payment not found.");
//             return res.status(404).send("Payment not found.");
//         }

//         // Update payment status to 'Paid'
//         payment.payment_status = 'Paid';
//         await payment.save();

//         console.log("✅ Payment Confirmed:", payment.id);

//         // Update booking status to 'Confirmed'
//         const booking = await Booking.findByPk(payment.booking_id);

//         if (!booking) {
//             console.error("❌ Booking not found.");
//             return res.status(404).send("Booking not found.");
//         }

//         booking.status = 'Confirmed';
//         await booking.save();

//         console.log("✅ Booking Confirmed:", booking.id);

//         // Reduce car availability after successful payment
//         const car = await Car.findByPk(booking.car_id);
//         if (car) {
//             if (car.availability > 0) {
//                 car.availability -= 1;
//                 await car.save();
//                 console.log("🚗 Car Availability Updated:", car.availability);
//             } else {
//                 console.warn("⚠️ Car already unavailable.");
//             }
//         }

//         res.redirect('/payment/success');
//     } catch (error) {
//         console.error("❌ Payment Confirmation Error:", error);
//         res.status(500).send("Error confirming payment.");
//     }
// };


exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        console.log("🔍 Confirming Payment:", paymentIntentId);

        // ✅ Find payment by Stripe transaction ID
        const payment = await Payment.findOne({ where: { id: paymentIntentId } });

        if (!payment) {
            console.error("❌ Payment not found.");
            return res.status(404).send("Payment not found.");
        }

        // ✅ Update payment status to 'Paid'
        payment.payment_status = 'Paid';
        await payment.save();

        console.log("✅ Payment Confirmed:", payment.id);

        // ✅ Update booking status to 'Confirmed'
        const booking = await Booking.findByPk(payment.booking_id);

        if (!booking) {
            console.error("❌ Booking not found.");
            return res.status(404).send("Booking not found.");
        }

        booking.status = 'Confirmed';
        await booking.save();
        console.log("✅ Booking Confirmed:", booking.id);

        // ✅ Reduce car availability only if it's greater than zero
        const car = await Car.findByPk(booking.car_id);
        if (car) {
            if (car.availability > 0) {
                car.availability -= 1;
                await car.save();
                console.log("🚗 Car Availability Updated:", car.availability);
            } else {
                console.warn("⚠️ Car already unavailable.");
            }
        }

        res.redirect('/payment/success');
    } catch (error) {
        console.error("❌ Payment Confirmation Error:", error);
        res.status(500).send("Error confirming payment.");
    }
};

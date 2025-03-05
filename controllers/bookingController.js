const { Booking, Car, Payment } = require('../models');

//     try {
//         const userId = req.user.id;

//         // Fetch bookings for the logged-in user, including car details
//         const bookings = await Booking.findAll({
//             where: { user_id: userId },
//             include: [
//                 { model: Car },  // Fetch car details
//                 { model: Payment } // Fetch payment details
//             ],
//             order: [['createdAt', 'DESC']] // Sort by latest bookings
//         });

//         res.render('myBookings', { title: "My Bookings | CarGo", bookings });
//     } catch (error) {
//         console.error("❌ Error fetching bookings:", error);
//         res.status(500).send("Server error");
//     }
// };

// exports.requestBookingEdit = async (req, res) => {

//     try {
//         const { booking_id, new_start_date, new_end_date } = req.body;
//         const booking = await Booking.findByPk(booking_id);

//         if (!booking) return res.status(404).send("Booking not found");

//         // Mark request as pending for admin approval
//         // booking.request_status = "Pending";
//         booking.request_status = "Edit Requested";
//         booking.new_start_date = new_start_date;
//         booking.new_end_date = new_end_date;
//         await booking.save();

//         res.json({ message: "Booking modification request sent to admin" });
//     } catch (error) {
//         console.error("Error requesting booking edit:", error);
//         res.status(500).send("Error processing request");
//     }
// };
exports.getUserBookings = async (req, res) => {
    try {
        const user_id = req.user.id;

        const bookings = await Booking.findAll({
            where: { user_id },
            include: [
                { model: Car, attributes: ['brand', 'model'] },
                { model: Payment }  // ✅ Ensure Payment details are included
            ],
            order: [['createdAt', 'DESC']]
        });

        const refundedPayments = await Payment.findAll({
            where: {
                user_id,
                payment_status: "refunded"
            }
        });

        console.log("📌 User Bookings Fetched:", JSON.stringify(bookings, null, 2)); // ✅ Log to check payment status
        res.render("myBookings", { title: "My Bookings | CarGo", bookings, refundedPayments });

    } catch (error) {
        console.error("❌ Error fetching user bookings:", error);
        res.status(500).send("Error fetching bookings.");
    }
};

exports.requestBookingEdit = async (req, res) => {
    try {
        const { booking_id, new_start_date, new_end_date, original_days } = req.body;

        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        // Calculate new duration
        const newDays = (new Date(new_end_date) - new Date(new_start_date)) / (1000 * 60 * 60 * 24);

        // Validate same number of days
        if (parseInt(original_days) !== newDays) {
            return res.status(400).json({ message: `❌ You must select exactly ${original_days} days.` });
        }

        // Update request status for admin approval
        booking.request_status = "Edit Requested";
        booking.new_start_date = new_start_date;
        booking.new_end_date = new_end_date;
        await booking.save();

        // res.json({ message: "Edit request submitted for admin approval." });
        res.redirect("/booking/my-bookings");
        
    } catch (err) {
        console.error("❌ Error requesting booking edit:", err);
        res.status(500).json({ message: "Error processing request." });
    }
};



// User Requests Cancellation
exports.requestBookingCancel = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        // booking.request_status = "Pending";
        booking.request_status = "Cancel Requested";
        await booking.save();

        // res.json({ message: "Cancellation request sent to admin" });
        res.redirect("/booking/my-bookings");
    } catch (error) {
        console.error("Error requesting cancellation:", error);
        res.status(500).send("Error processing request");
    }
};


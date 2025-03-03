const { Booking, Car, Payment } = require('../models');

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch bookings for the logged-in user, including car details
        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [
                { model: Car },  // Fetch car details
                { model: Payment } // Fetch payment details
            ],
            order: [['createdAt', 'DESC']] // Sort by latest bookings
        });

        res.render('myBookings', { title: "My Bookings | CarGo", bookings });
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        res.status(500).send("Server error");
    }
};

exports.requestBookingEdit = async (req, res) => {
    try {
        const { booking_id, new_start_date, new_end_date } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        // Mark request as pending for admin approval
        // booking.request_status = "Pending";
        booking.request_status = "Edit Requested";
        booking.new_start_date = new_start_date;
        booking.new_end_date = new_end_date;
        await booking.save();

        res.json({ message: "Booking modification request sent to admin" });
    } catch (error) {
        console.error("Error requesting booking edit:", error);
        res.status(500).send("Error processing request");
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

        res.json({ message: "Cancellation request sent to admin" });
    } catch (error) {
        console.error("Error requesting cancellation:", error);
        res.status(500).send("Error processing request");
    }
};


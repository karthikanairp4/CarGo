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

exports.editBookingPage = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const booking = await Booking.findByPk(booking_id, { include: Car });

        if (!booking) {
            return res.status(404).send("Booking not found.");
        }

        res.render('editBooking', { title: "Edit Booking | Car Rental", booking });
    } catch (error) {
        console.error("❌ Error loading edit booking page:", error);
        res.status(500).send("Error loading booking details.");
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { start_date, end_date } = req.body;

        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            return res.status(404).send("Booking not found.");
        }

        booking.start_date = start_date;
        booking.end_date = end_date;
        await booking.save();

        res.redirect('/myBookings');
    } catch (error) {
        console.error("❌ Error updating booking:", error);
        res.status(500).send("Error updating booking.");
    }
};


exports.cancelBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) {
            return res.status(404).send("Booking not found.");
        }

        await booking.destroy(); // Delete the booking
        res.redirect('/myBookings');
    } catch (error) {
        console.error("❌ Error canceling booking:", error);
        res.status(500).send("Error canceling booking.");
    }
};


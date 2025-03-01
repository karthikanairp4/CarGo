const { Booking, Car } = require('../models');

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch bookings for the logged-in user, including car details
        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [{ model: Car, attributes: ['brand', 'model', 'price_per_day', 'image'] }]
        });

        res.render('myBookings', { title: "My Bookings", bookings });
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        res.status(500).send("Server error");
    }
};

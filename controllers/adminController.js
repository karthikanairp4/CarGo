const { Booking, User, Car, Payment } = require("../models");

const { Op } = require("sequelize");
exports.adminDashboard = async (req, res) => {
    try {
        const pendingRequests = await Booking.findAll({
            where: { 
                request_status: { 
                    [Op.or]: ["Edit Requested", "Cancel Requested"]  // ✅ Fetch both types of requests
                } 
            },
            include: [{ model: User }, { model: Car }]
        });
        console.log("✅ Admin Dashboard Loaded, Pending Requests:", pendingRequests.length);
        res.render("adminDashboard", {
            title: "Admin Dashboard | CarGo",
            pendingRequests
        });
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        res.status(500).send("Server error");
    }
};



exports.getPendingRequests = async (req, res) => {
    console.log("🔍 Checking Admin Role:", req.user ? req.user.role : "No User Found");

    if (!req.user || req.user.role !== 'admin') {
        console.error("❌ Access Denied: Not an Admin");
        req.flash('error', 'Unauthorized access.');
        return res.redirect('/');
    }

    try {
        const pendingRequests = await Booking.findAll({
            where: { status: "Pending" },
            include: [
                { model: User, attributes: ['id', 'email'] },
                { model: Car, attributes: ['brand', 'model'] }
            ]
        });

        console.log("✅ Admin Dashboard Loaded, Pending Requests:", pendingRequests.length);

        res.render('adminDashboard', {
            title: "Admin Dashboard | Car Rental",
            pendingRequests
        });

    } catch (err) {
        console.error("❌ Error Fetching Pending Requests:", err);
        res.status(500).send("Error loading admin dashboard.");
    }
};

exports.approveRequest = async (req, res) => {

    try {
        console.log("📌 Received Request Data:", req.body);

        const { booking_id } = req.body;
        if (!booking_id) {
            console.error("❌ Missing Booking ID");
            return res.status(400).json({ message: "Missing Booking ID" });
        }

        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            console.error("❌ Booking not found.");
            return res.status(404).json({ message: "Booking not found" });
        }

        // ✅ Handle Edit Request
        if (booking.request_status === "Edit Requested") {
            console.log("✏️ Edit Request Approved");

            // Ensure `new_start_date` & `new_end_date` exist before updating
            if (booking.new_start_date && booking.new_end_date) {
                booking.start_date = booking.new_start_date;
                booking.end_date = booking.new_end_date;
            } else {
                console.error("❌ New dates not provided.");
                return res.status(400).json({ message: "New dates missing in request." });
            }
        }

        // ✅ Handle Cancel Request
        else if (booking.request_status === "Cancel Requested") {
            console.log("❌ Cancel Request Approved");

            // **Find and update the payment status**
            const payment = await Payment.findOne({ where: { booking_id: booking.id } });

            if (payment) {
                payment.payment_status = "Refunded"; // ✅ Mark payment as refunded
                await payment.save();
                console.log("💰 Payment Status Updated to Refunded");
            } else {
                console.warn("⚠️ No payment record found for this booking.");
            }

            // Delete the booking from the database
            await booking.destroy();
            console.log("✅ Booking Cancelled & Removed:", booking.id);
            return res.status(200).json({ message: "Booking Cancelled Successfully" });
        }

        // ✅ Approve Request
        booking.request_status = "Approved";
        booking.status = "Confirmed";
        await booking.save();

        console.log("✅ Booking Request Approved:", booking.id);
        res.status(200).json({ message: "Request Approved Successfully" });

    } catch (err) {
        console.error("❌ Error approving request:", err);
        res.status(500).json({ message: "Error processing request", error: err.message });
    }
};








// ✅ Reject Edit or Cancel Request
exports.rejectRequest = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // ✅ Reset request_status to remove pending status
        booking.request_status = "Rejected";
        await booking.save();

        console.log("✅ Booking Request Rejected:", booking.id);
        res.json({ message: "Booking request rejected successfully" });

    } catch (error) {
        console.error("❌ Error rejecting request:", error);
        res.status(500).json({ message: "Error processing request" });
    }
};





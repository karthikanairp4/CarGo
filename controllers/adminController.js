const { Booking, User, Car } = require("../models");


// Admin Dashboard - View All Pending Requests
// exports.adminDashboard = async (req, res) => {
//     try {
//         const pendingRequests = await Booking.findAll({
//             where: { request_status: "Edit Requested" },
//             include: [{ model: User }, { model: Car }]
//         });

//         res.render("adminDashboard", {
//             title: "Admin Dashboard | Car Rental",
//             pendingRequests
//         });
//     } catch (error) {
//         console.error("Error loading admin dashboard:", error);
//         res.status(500).send("Server error");
//     }
// };

const { Op } = require("sequelize");

exports.adminDashboard = async (req, res) => {
    try {
        console.log("🔍 Fetching Pending Requests...");
        
        const pendingRequests = await Booking.findAll({
            where: { 
                request_status: { 
                    [Op.or]: ["Edit Requested", "Cancel Requested"]
                } 
            },
            include: [{ model: User }, { model: Car }],
            logging: console.log // ✅ Log generated SQL query
        });

        console.log("✅ Admin Dashboard Loaded, Pending Requests:", pendingRequests.length);
        console.log("📄 Fetched Data:", pendingRequests.map(b => ({
            id: b.id, 
            request_status: b.request_status,
            user: b.User ? b.User.email : "No User",
            car: b.Car ? b.Car.brand : "No Car"
        })));

        res.render("adminDashboard", {
            title: "Admin Dashboard | Car Rental",
            pendingRequests
        });
    } catch (error) {
        console.error("❌ Error loading admin dashboard:", error);
        res.status(500).send("Server error");
    }
};


// Admin Approves Booking Edit
exports.approveBookingEdit = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        // Update booking details
        booking.status = "Confirmed";
        booking.request_status = "Approved";
        await booking.save();

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error approving booking edit:", error);
        res.status(500).send("Error processing request");
    }
};


// Admin Rejects Booking Edit
exports.rejectBookingEdit = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        booking.request_status = "Rejected";
        await booking.save();

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error rejecting booking edit:", error);
        res.status(500).send("Error processing request");
    }
};


// Admin Approves Cancellation
exports.approveBookingCancel = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        booking.status = "Cancelled";
        booking.request_status = "Approved";
        await booking.save();

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error approving cancellation:", error);
        res.status(500).send("Error processing request");
    }
};


// Admin Rejects Cancellation
exports.rejectBookingCancel = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).send("Booking not found");

        booking.request_status = "Rejected";
        await booking.save();

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Error rejecting cancellation:", error);
        res.status(500).send("Error processing request");
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
        console.log("📌 Received Request Data:", req.body); // ✅ Debugging line

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

        // Update booking to approved
        booking.request_status = "Approved";
        booking.status = "Confirmed";
        await booking.save();

        console.log("✅ Booking Approved:", booking.id);
        res.status(200).json({ message: "Request Approved" });

    } catch (err) {
        console.error("❌ Error approving request:", err);
        res.status(500).json({ message: "Error processing request", error: err.message });
    }
};



// ✅ Reject Edit or Cancel Request
exports.rejectRequest = async (req, res) => {
    try {
        console.log("📌 Reject Request Received:", req.body);

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

        // Reset the request status back to "Rejected"
        booking.request_status = "Rejected";
        await booking.save();

        console.log("✅ Booking Rejected:", booking.id);
        res.status(200).json({ message: "Request Rejected" });

    } catch (err) {
        console.error("❌ Error rejecting request:", err);
        res.status(500).json({ message: "Error processing request", error: err.message });
    }
};




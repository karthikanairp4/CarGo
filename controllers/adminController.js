const { Booking, User, Car, Payment } = require("../models");

const { Op } = require("sequelize");

// exports.adminDashboard = async (req, res) => {
//     try {
//         console.log("🔍 Fetching Pending Requests...");
        
//         const pendingRequests = await Booking.findAll({
//             where: { 
//                 request_status: { 
//                     [Op.or]: ["Edit Requested", "Cancel Requested"]
//                 } 
//             },
//             include: [{ model: User }, { model: Car }],
//             logging: console.log // ✅ Log generated SQL query
//         });

//         console.log("✅ Admin Dashboard Loaded, Pending Requests:", pendingRequests.length);
//         console.log("📄 Fetched Data:", pendingRequests.map(b => ({
//             id: b.id, 
//             request_status: b.request_status,
//             user: b.User ? b.User.email : "No User",
//             car: b.Car ? b.Car.brand : "No Car"
//         })));

//         res.render("adminDashboard", {
//             title: "Admin Dashboard | Car Rental",
//             pendingRequests
//         });
//     } catch (error) {
//         console.error("❌ Error loading admin dashboard:", error);
//         res.status(500).send("Server error");
//     }
// };

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
            title: "Admin Dashboard | Car Rental",
            pendingRequests
        });
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        res.status(500).send("Server error");
    }
};



// Admin Approves Booking Edit
// exports.approveBookingEdit = async (req, res) => {
//     try {
//         const { booking_id } = req.body;
//         const booking = await Booking.findByPk(booking_id);

//         if (!booking) return res.status(404).json({ message: "Booking not found" });

//         // ✅ Check if this is an "Edit Requested" booking
//         if (booking.request_status === "Edit Requested") {
//             // ✅ Apply new dates (assuming they are stored in new_start_date, new_end_date)
//             booking.start_date = booking.new_start_date;
//             booking.end_date = booking.new_end_date;
//         }

//         // ✅ Mark as confirmed & approved
//         booking.status = "Confirmed";
//         booking.request_status = "Approved";
//         await booking.save();

//         console.log("✅ Booking Edit Approved:", booking.id);
//         res.json({ message: "Booking edit approved successfully" });

//     } catch (error) {
//         console.error("❌ Error approving booking edit:", error);
//         res.status(500).json({ message: "Error processing request" });
//     }
// };

exports.approveBookingEdit = async (req, res) => {
    try {
        const { booking_id } = req.body;
        console.log("📌 Approving Edit Request for Booking ID:", booking_id);

        const booking = await Booking.findByPk(booking_id);

        if (!booking) {
            console.error("❌ Booking not found");
            return res.status(404).send("Booking not found");
        }

        // Check if the booking has new requested dates
        if (!booking.new_start_date || !booking.new_end_date) {
            console.error("❌ No requested dates found");
            return res.status(400).send("No requested dates found");
        }

        // ✅ Apply the new start_date and end_date
        booking.start_date = booking.new_start_date;
        booking.end_date = booking.new_end_date;

        console.log("✅ New Start Date:", booking.start_date);
        console.log("✅ New End Date:", booking.end_date);

        // ✅ Reset the request_status and update booking status
        booking.request_status = null; // No pending request anymore
        booking.status = "Confirmed";

        // ✅ Save the updated booking
        await booking.save();

        console.log("✅ Booking Updated Successfully:", booking.toJSON());

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("❌ Error approving booking edit:", error);
        res.status(500).send("Error processing request");
    }
};





// Admin Rejects Booking Edit
// exports.rejectBookingEdit = async (req, res) => {
//     try {
//         const { booking_id } = req.body;
//         const booking = await Booking.findByPk(booking_id);

//         if (!booking) return res.status(404).send("Booking not found");

//         booking.request_status = "Rejected";
//         await booking.save();

//         res.redirect("/admin/dashboard");
//     } catch (error) {
//         console.error("Error rejecting booking edit:", error);
//         res.status(500).send("Error processing request");
//     }
// };

exports.rejectBookingEdit = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // ✅ Reset request status and clear requested dates
        booking.request_status = "Rejected";
        booking.requested_start_date = null;
        booking.requested_end_date = null;
        await booking.save();

        console.log("✅ Booking Edit Rejected:", booking.id);
        res.json({ message: "Booking edit request rejected." });

    } catch (error) {
        console.error("❌ Error rejecting booking edit:", error);
        res.status(500).json({ message: "Error processing request." });
    }
};



// Admin Approves Cancellation
// exports.approveBookingCancel = async (req, res) => {
//     try {
//         const { booking_id } = req.body;
//         const booking = await Booking.findByPk(booking_id);

//         if (!booking) return res.status(404).json({ message: "Booking not found" });

//         // ✅ Reduce car availability since the booking is canceled
//         const car = await Car.findByPk(booking.car_id);
//         if (car) {
//             car.availability += 1;
//             await car.save();
//         }

//         // ✅ Delete booking or mark as "Cancelled"
//         await booking.destroy(); // (Use this if you want to remove the booking completely)
//         // booking.status = "Cancelled";
//         // await booking.save(); // (Use this if you want to keep a record)

//         console.log("✅ Booking Cancel Approved:", booking.id);
//         res.json({ message: "Booking cancellation approved successfully" });

//     } catch (error) {
//         console.error("❌ Error approving cancellation:", error);
//         res.status(500).json({ message: "Error processing request" });
//     }
// };

exports.approveBookingCancel = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = "Cancelled";
        booking.request_status = "Approved";
        await booking.save();

        res.json({ message: "Booking cancelled successfully." });
    } catch (error) {
        console.error("Error approving cancellation:", error);
        res.status(500).send("Error processing request");
    }
};


exports.rejectBookingCancel = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.request_status = "Rejected";
        await booking.save();

        console.log("✅ Booking Cancellation Rejected:", booking.id);
        res.json({ message: "Booking cancellation request rejected." });

    } catch (error) {
        console.error("❌ Error rejecting cancellation:", error);
        res.status(500).json({ message: "Error processing request." });
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





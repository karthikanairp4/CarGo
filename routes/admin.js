const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const carController = require('../controllers/carController');

// router.get("/dashboard", verifyToken, verifyAdmin, adminController.adminDashboard);

// router.get('/dashboard', verifyToken, verifyAdmin, (req, res) => {
//     console.log("✅ Admin Authenticated:", req.user);
//     res.render('adminDashboard', { title: "Admin Dashboard", admin: req.user });
// });
router.get('/dashboard', verifyToken, verifyAdmin, adminController.adminDashboard); 

// Admin approves or rejects booking requests
router.post("/approve-edit", verifyToken, verifyAdmin, adminController.approveBookingEdit);
router.post("/reject-edit", verifyToken, verifyAdmin, adminController.rejectBookingEdit);
router.post("/approve-cancel", verifyToken, verifyAdmin, adminController.approveBookingCancel);
router.post("/reject-cancel", verifyToken, verifyAdmin, adminController.rejectBookingCancel);

router.post('/approve-request', verifyToken, verifyAdmin, adminController.approveRequest);

// ✅ Route: Reject Booking Edit/Cancel Request
router.post('/reject-request', verifyToken, verifyAdmin, adminController.rejectRequest);

// Admin Car Management Routes
router.get("/cars", verifyToken, verifyAdmin, carController.listAllCars);
router.get("/cars/add", verifyToken, verifyAdmin, carController.showAddCarForm);
router.post("/cars/add", verifyToken, verifyAdmin, carController.addCar);
router.get("/cars/edit/:id", verifyToken, verifyAdmin, carController.showEditCarForm);
router.post("/cars/edit/:id", verifyToken, verifyAdmin, carController.editCar);
router.post("/cars/delete/:id", verifyToken, verifyAdmin, carController.deleteCar);


module.exports = router;

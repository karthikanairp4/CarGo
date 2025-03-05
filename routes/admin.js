const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const carController = require('../controllers/carController');

router.get('/dashboard', verifyToken, verifyAdmin, adminController.adminDashboard); 

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

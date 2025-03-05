const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// Get All Available Cars
exports.listAvailableCars = async (req, res) => {
    try {
        const cars = await Car.findAll({
            where: { availability: { [Op.gt]: 0 } }, // Fetch only available cars
        });

        res.render('carListing', {
            title: "Available Cars | CarGo",
            cars
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching cars");
    }
};

// for getting booking page
exports.showBookingPage = async (req, res) => {
    try {
        const { car_id } = req.params;

        console.log("🔍 Car ID Received:", car_id); // Debugging step

        if (!car_id) {
            console.error("❌ Error: Car ID is missing in request.");
            return res.status(400).send("Car ID is required");
        }

        const car = await Car.findByPk(car_id);

        if (!car) {
            console.error("❌ Error: Car Not Found for ID:", car_id);
            return res.status(404).send("Car not found");
        }

        res.render('carBooking', { 
            car,
            user: req.user || null,  // Ensure user is available
            start_date: "",  
            end_date: "",
            total_price: ""
        });
    } catch (error) {
        console.error("❌ Error loading booking page:", error);
        res.status(500).send("Server error");
    }
};


// Process Booking Submission
// exports.processBooking = async (req, res) => {
//     try {
//         const { start_date, end_date, total_price } = req.body;
//         const carId = req.params.id;

//         // Ensure car exists
//         const car = await Car.findByPk(carId);
//         if (!car) {
//             return res.status(404).send("Car not found");
//         }

//         // Create a new booking
//         await Booking.create({
//             car_id: carId,
//             user_id: req.session.user.id, // Ensure user is logged in
//             start_date,
//             end_date,
//             total_price,
//             status: "Pending"
//         });

//         res.redirect('/cars/list'); // Redirect to available cars list
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error processing booking");
//     }
// };

// Add a New Car (Admin Only)
// exports.addCar = async (req, res) => {
//     const { model, brand, price_per_day, image } = req.body;

//     try {
//         await Car.addCar(model, brand, price_per_day, image);
//         req.flash('success', 'Car added successfully.');
//         res.redirect('/admin/dashboard');
//     } catch (err) {
//         console.error(err);
//         req.flash('error', 'Failed to add car.');
//         res.redirect('/admin/dashboard');
//     }
// };


//Admin management

// ✅ List All Cars for Admin
exports.listAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll();
        res.render("adminCars", { title: "Manage Cars | Admin", cars });
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).send("Error loading cars");
    }
};

// ✅ Show Add Car Form
exports.showAddCarForm = (req, res) => {
    res.render("addCar", { title: "Add New Car" });
};

// ✅ Handle Add Car Request
exports.addCar = async (req, res) => {
    try {
        const { brand, model, price_per_day, availability, image } = req.body;
        await Car.create({ brand, model, price_per_day, availability, image });
        res.redirect("/admin/cars");
    } catch (error) {
        console.error("Error adding car:", error);
        res.status(500).send("Error adding car");
    }
};

// ✅ Show Edit Car Form
exports.showEditCarForm = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) return res.status(404).send("Car not found");
        res.render("editCar", { title: "Edit Car", car });
    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send("Error loading car data");
    }
};

// ✅ Handle Edit Car Request
exports.editCar = async (req, res) => {
    try {
        const { brand, model, price_per_day, availability, image } = req.body;
        const car = await Car.findByPk(req.params.id);
        if (!car) return res.status(404).send("Car not found");

        await car.update({ brand, model, price_per_day, availability, image });
        res.redirect("/admin/cars");
    } catch (error) {
        console.error("Error editing car:", error);
        res.status(500).send("Error updating car details");
    }
};

// ✅ Handle Delete Car Request
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) return res.status(404).send("Car not found");

        await car.destroy();
        res.redirect("/admin/cars");
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).send("Error deleting car");
    }
};

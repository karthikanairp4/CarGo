const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const { registerLimiter } = require('../middleware/authMiddleware');

// Register Route
router.get('/register', userController.getRegisterPage);
router.post('/register',userController.registerUser);

// Login Route
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

// Logout Route
router.get('/logout', userController.logoutUser);

// router.get('/getAllUsers', userController.getAllUsers);

module.exports = router;

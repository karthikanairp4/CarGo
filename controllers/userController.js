const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.registerUser = [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(err => err.msg).join(', '));
            return res.redirect('/auth/register');
        }

        const { name, email, password } = req.body;

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                req.flash('error', 'Email already registered');
                return res.redirect('/auth/register');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({ name, email, password: hashedPassword });

            req.flash('success', 'Registration successful. Please login.');
            res.redirect('/auth/login');
        } catch (err) {
            console.error(err);
            req.flash('error', 'An error occurred.');
            res.redirect('/auth/register');
        }
    }
];

// exports.loginUser = [

//     body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
//     body('password').notEmpty().withMessage('Password is required'),

//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             req.flash('error', errors.array().map(err => err.msg).join(', '));
//             console.log("Error in login")
//             return res.redirect('/auth/login');
//             // return res.json({ message: "Error in login" });
//         }

//         const { email, password } = req.body;

//         try {
//             const user = await User.findOne({ where: { email } });
//             if (!user) {
//                 req.flash('error', 'Invalid email or password');
//                 // return res.json({ message: "Invalid email or password" });
//                 return res.redirect('/auth/login');
//             }

//             const passwordMatch = await bcrypt.compare(password, user.password);
//             if (!passwordMatch) {
//                 req.flash('error', 'Invalid email or password');
//                 return res.redirect('/auth/login');
//                 // return res.json({ message: "Invalid email or password" });
//             }

//             // Generate JWT Token
//             const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
//             console.log(token);

//             // Store token in cookie
//             res.cookie('token', token, { httpOnly: true });

//             req.flash('success', `Welcome, ${user.name}`);
//             req.session.user = { id: user.id, name: user.name, email: user.email };
//             // res.json({ message: "Login successful" });
//             // return user.role === 'admin' ? res.redirect('/admin/dashboard') : res.redirect('/user/dashboard');
//             return user.role === 'admin' ? res.redirect('/admin/dashboard') : res.redirect('/');
//         } catch (err) {
//             console.error(err);
//             req.flash('error', 'An error occurred.');
//             res.redirect('/auth/login');
//             // return res.json({ message: "An error occurred" });
//         }
//     }
// ];

exports.loginUser = [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(err => err.msg).join(', '));
            console.log("Error in login");
            return res.redirect('/auth/login');
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/auth/login');
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/auth/login');
            }

            // ✅ Generate JWT Token with user role
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            console.log("Generated Token:", token);

            // ✅ Store token in cookies
            res.cookie('token', token, { httpOnly: true });

            // ✅ Store user in session
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            console.log("🔍 Logged-in User:", req.session.user);

            // ✅ Redirect based on user role
            if (user.role === 'admin') {
                console.log("✅ Admin Login - Redirecting to Admin Dashboard");
                return res.redirect('/admin/dashboard'); // Correct redirect for admin
            } else {
                console.log("✅ User Login - Redirecting to User Dashboard");
                return res.redirect('/');  // Correct redirect for user
            }

        } catch (err) {
            console.error("❌ Login Error:", err);
            req.flash('error', 'An error occurred.');
            return res.redirect('/auth/login');
        }
    }
];



exports.getRegisterPage = (req, res) => {
    res.render('register');
};

exports.getLoginPage = (req, res) => {
    res.render('login');
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token');  // Remove JWT token from cookies
    req.session.destroy();
    res.redirect('/auth/login');
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        // res.render('users', { users });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving users');
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('userDetails', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        await User.update({ name, email, role }, { where: { id: req.params.id } });
        req.flash('success', 'User updated successfully.');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update user.');
        res.redirect('/admin/users');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        req.flash('success', 'User deleted successfully.');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to delete user.');
        res.redirect('/admin/users');
    }
};

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const db = require('./config/db');
const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require("./routes/admin");
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Set EJS as view engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Middleware to make `user` available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Set user globally
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/cars', carRoutes);
app.use('/payment', paymentRoutes);
app.use('/booking', bookingRoutes);
app.use("/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

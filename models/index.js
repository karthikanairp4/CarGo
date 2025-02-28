const sequelize = require('../config/db');
const User = require('./User');
const Car = require('./Car');
const Booking = require('./Booking');
const Payment = require('./Payment');

// Sync models with database
sequelize.sync({ force: false })  // `force: false` prevents data loss
    .then(() => console.log('✅ Database & tables synced'))
    .catch(err => console.error('❌ Error syncing database:', err));

module.exports = { User, Car, Booking, Payment };

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Booking = require('./Booking');
const User = require('./User');

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    payment_status: { type: DataTypes.ENUM('pending', 'completed', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
}, {
    timestamps: true,
    tableName: 'Payments',
});

// Define relationships
Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Payment;

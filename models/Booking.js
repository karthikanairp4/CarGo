const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Car = require('./Car');

const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    car_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Car, key: 'id' } },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { 
        type: DataTypes.ENUM('pending', 'confirmed', 'canceled', 'completed'), 
        defaultValue: 'pending' 
    },
    request_status: { 
        type: DataTypes.ENUM("None", "Edit Requested", "Cancel Requested", "Approved", "Rejected"), 
        defaultValue: "None" 
    },
    new_start_date: { type: DataTypes.DATEONLY, allowNull: true },  // ✅ Temporary field for edit requests
    new_end_date: { type: DataTypes.DATEONLY, allowNull: true },    // ✅ Temporary field for edit requests
}, {
    timestamps: true,
    tableName: 'Bookings',
});

// Define relationships
User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Car.hasMany(Booking, { foreignKey: 'car_id', onDelete: 'CASCADE' });
Booking.belongsTo(Car, { foreignKey: 'car_id' });

module.exports = Booking;

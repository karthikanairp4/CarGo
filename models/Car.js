const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Car = sequelize.define('Car', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    model: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    price_per_day: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    availability: { type: DataTypes.BOOLEAN, defaultValue: true },
    image: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: false,
    tableName: 'Cars',
});

module.exports = Car;

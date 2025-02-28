const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to MySQL database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,  // Disable query logging
});

// Test database connection
sequelize.authenticate()
    .then(() => console.log('✅ Connected to MySQL with Sequelize'))
    .catch(err => console.error('❌ Unable to connect:', err));

module.exports = sequelize;

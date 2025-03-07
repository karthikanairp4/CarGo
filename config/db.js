const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to MySQL database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,  // Disable query logging
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,  // Increase timeout to 60 seconds
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000  // Increase connection timeout
    }
});

// Test database connection
sequelize.authenticate()
    .then(() => console.log('✅ Connected to MySQL with Sequelize'))
    .catch(err => console.error('❌ Unable to connect:', err));

module.exports = sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false
		}
	},
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});
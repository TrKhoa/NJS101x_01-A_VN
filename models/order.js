const Sq = require('sequelize');

const sq = require('../util/database');

const Order = sq.define('order', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Order;

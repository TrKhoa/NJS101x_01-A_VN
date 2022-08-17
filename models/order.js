const Sq = require('sequelize');

const sq = require('../util/database');

const Order = sq.define('order', {
    id: {
        type: Sq.INTEGER,
        allowNull: false,
        auoIncrement: true,
        primaryKey: true
    },
})

module.exports = Order;

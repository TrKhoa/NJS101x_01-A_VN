const Sq = require('sequelize');

const sq = require('../util/database');

const OrderItem = sq.define('orderitem', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sq.INTEGER
});

module.exports = OrderItem;

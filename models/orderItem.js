const Sq = require('sequelize');

const sq = require('../util/database');

const OrderItem = sq.define('ordertitem', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sq.INTEGER
});

module.exports = OrderItem;

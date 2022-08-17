const Sq = require('sequelize');

const sq = require('../util/database');

const CartItem = sq.define('cartItem', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sq.INTEGER
});

module.exports = CartItem;

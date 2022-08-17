const Sq = require('sequelize');

const sq = require('../util/database');

const Cart = sq.define('cart', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;

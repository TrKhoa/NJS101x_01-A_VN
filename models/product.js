const Sq = require('sequelize');

const sq = require('../util/database');

const Product = sq.define('product',{
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: Sq.STRING,
    price: {
        type: Sq.DOUBLE,
        allowNull: false
    },
    description: Sq.STRING,
    imgUrl: {
        type: Sq.STRING,
        allowNull:false
    }
})

module.exports = Product;

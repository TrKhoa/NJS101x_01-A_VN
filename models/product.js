const Sq = require('sequelize');

const sp = require('./util/database');

const Product = sq.define('product',{
    id: {
        type: Sq.INTERGER,
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

const Sq = require('sequelize');

const sq = require('../util/database');

const User = sq.define('user', {
    id: {
        type: Sq.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sq.STRING,
    email: Sq.STRING
})

module.eports = User;

const mongoConnect = require('../util/database');

class Product {
    constructor(itle,price,description,imageUrl){
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    save(){

    }
}
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

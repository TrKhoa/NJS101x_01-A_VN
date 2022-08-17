const getDb = require('../util/database').getDb;

class Product {
    constructor(itle, price, description, imageUrl) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    save() {
        const db = getDb();
        db.collection('products')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }
}

module.exports = Product;

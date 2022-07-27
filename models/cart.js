const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0
            };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            const existProdIdx = cart.products.findIndex(prod => prod.id === id);
            const existProd = cart.products[existProdIdx];
            let updatedProd;
            if (existProd) {
                updatedProd = {
                    ...existProd
                };
                updatedProd.qty += 1;
                cart.products = [...cart.products];
                cart.products[existProdIdx] = updatedProd;
            } else {
                updatedProd = {
                    id: id,
                    qty: 1
                };
                cart.products = [...cart.products, updatedProd];
            }
            cart.totalPrice += productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        })
    }
}

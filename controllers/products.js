const Products = require('../models/product');

exports.getAddProduct = (req, res, next) => {

    res.render('add-product',{
        pageTitle: 'Add product',
        path: 'admin/add-product',
        activeAddProduct: true,
        productCSS: true,
        formCSS: true
    });
};

exports.postAddProduct = (req, res, next) => {
    const products = new Products(req.body.title);
    products.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    Products.fetchAll(products =>{
        res.render('shop', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            hasProduct: products.length >0,
            activeShop: true,
            productCSS: true,
        });
    });
};

exports.products = Products;

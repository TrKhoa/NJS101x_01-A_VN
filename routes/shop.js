const path = require('path');

const rootDir = require('../util/path')

const express = require('express');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log(adminData.products);
  res.render('shop', {prods: adminData.products, pageTitle: 'Shop', path: '/', hasProduct: adminData.products.length >0});
});

module.exports = router;

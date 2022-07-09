const path = require('path');

const rootDir = require('../util/path')

const express = require('express');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log(adminData.products);
  res.render('shop', {prods: adminData.products, docTitle: 'Shop'});
});

module.exports = router;

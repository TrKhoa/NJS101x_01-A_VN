const path = require('path');

const rootDir = require('../util/path')

const express = require('express');
const productController = require('../controllers/products');

const router = express.Router();

router.get('/', productController.getProducts);

module.exports = router;

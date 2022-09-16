const path = require('path');
const express = require('express');
const authController = require('../controllers/auth');//Khai báo controller cần dùng
const router = express.Router();

//Khai báo dường dẫn
router.get('/MH-6/login', authController.getLogin);
router.post('/MH-6/login', authController.postLogin);
router.get('/logout', authController.getLogout);

module.exports = router;

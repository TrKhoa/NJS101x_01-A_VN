const path = require('path');
const express = require('express');
const showController = require('../controllers/show');
const isAuth = require('../middleware/is-auth');
const isManager = require('../middleware/is-manager');
const router = express.Router();

//Khai báo dường dẫn
router.get('/', isAuth, showController.getIndex);
router.get('/MH-1/history', isAuth, showController.getTodayHistory);
router.get('/MH-2/profile', isAuth, showController.getProfile);
router.get('/MH-3', isAuth, showController.getDashboard);
router.get('/MH-4', isAuth, showController.getCovid);
router.get('/MH-5', isAuth, isManager, showController.getEmployeeWork);

module.exports = router;

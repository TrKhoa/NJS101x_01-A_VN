const path = require('path');

const express = require('express');

const showController = require('../controllers/show');

const router = express.Router();

router.get('/', showController.getIndex);

router.get('/MH-1/history', showController.getTodayHistory);

router.get('/MH-2/profile', showController.getProfile);

router.get('/MH-3', showController.getDashboard);

router.get('/MH-4', showController.getCovid);

module.exports = router;

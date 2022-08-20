const path = require('path');

const express = require('express');

const modifyController = require('../controllers/modify');

const router = express.Router();

router.get('/MH-1/attendance', modifyController.getAttendance);

router.post('/MH-1/attendance', modifyController.postAttendance);

router.get('/MH-1/annualLeave', modifyController.getAnnualLeave);

router.post('/MH-1/annualLeave', modifyController.postAnnualLeave);

router.post('/MH-2/profile', modifyController.postProfile);

router.get('/MH-4/temperature-register', modifyController.getTemperatureResgister);

router.post('/MH-4/temperature-register', modifyController.postTemperatureResgister);

router.get('/MH-4/vaccine-register', modifyController.getVaccineRegister);

router.post('/MH-4/vaccine-register', modifyController.postVaccineRegister);

router.get('/MH-4/covid-report', modifyController.getCovidReport);

router.post('/MH-4/covid-report', modifyController.postCovidReport);

module.exports = router;

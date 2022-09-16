const path = require('path');
const express = require('express');
const modifyController = require('../controllers/modify');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

//Khai báo dường dẫn
router.get('/MH-1/attendance', isAuth, modifyController.getAttendance);
router.post('/MH-1/attendance', isAuth, modifyController.postAttendance);
router.get('/MH-1/annualLeave', isAuth, modifyController.getAnnualLeave);
router.post('/MH-1/annualLeave', isAuth, modifyController.postAnnualLeave);
router.post('/MH-2/profile', isAuth, modifyController.postProfile);
router.post('/MH-3/salary', isAuth, modifyController.postSalary);
router.get('/MH-4/temperature-register', isAuth, modifyController.getTemperatureResgister);
router.post('/MH-4/temperature-register', isAuth, modifyController.postTemperatureResgister);
router.get('/MH-4/vaccine-register', isAuth, modifyController.getVaccineRegister);
router.post('/MH-4/vaccine-register', isAuth, modifyController.postVaccineRegister);
router.get('/MH-4/covid-report', isAuth, modifyController.getCovidReport);
router.post('/MH-4/covid-report', isAuth, modifyController.postCovidReport);

module.exports = router;

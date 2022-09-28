const path = require('path');
const express = require('express');
const { body } = require('express-validator/check');
const router = express.Router();
const modifyController = require('../controllers/modify');
const isValid = require('../middleware/vaccine-validate');
const isAuth = require('../middleware/is-auth');
const isFrozen = require('../middleware/is-frozen');
const isManager = require('../middleware/is-manager');

//Khai báo dường dẫn
router.get('/MH-1/attendance', isAuth, isFrozen, modifyController.getAttendance);
router.post('/MH-1/attendance', isAuth, isFrozen, modifyController.postAttendance);
router.get('/MH-1/annualLeave', isAuth, isFrozen, modifyController.getAnnualLeave);
router.post('/MH-1/annualLeave', isAuth, isFrozen, modifyController.postAnnualLeave);
router.post('/MH-2/profile', isAuth, modifyController.postProfile);
router.post('/MH-3/salary', isAuth, modifyController.postSalary);
router.get('/MH-4/temperature-register', isAuth, modifyController.getTemperatureResgister);
router.post('/MH-4/temperature-register', isAuth, modifyController.postTemperatureResgister);
router.get('/MH-4/vaccine-register', isAuth, modifyController.getVaccineRegister);
router.post('/MH-4/vaccine-register', isAuth, isValid.vaccine, modifyController.postVaccineRegister);
router.get('/MH-4/covid-report', isAuth, modifyController.getCovidReport);
router.post('/MH-4/covid-report', isAuth, isValid.report, modifyController.postCovidReport);
router.get('/MH04/getPdf/:userId', isAuth, modifyController.getPdf);
router.get('/MH-5/delete', isAuth, isManager, modifyController.getHistoryDelete);
router.post('/MH-5/frozen', isAuth, isManager, modifyController.postFrozen);

module.exports = router;

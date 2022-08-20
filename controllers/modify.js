const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');
const TemperatureRegister = require('../models/temperatureregister');
const VaccineRegister = require('../models/vaccineregister');
const CovidReport = require('../models/covidreport');

const alert = require('alert');

function msToTime(time) {
    var ms = time % 1000;
    time = (time - ms) / 1000;
    var secs = time % 60;
    time = (time - secs) / 60;
    var mins = time % 60;
    var hrs = (time - mins) / 60;
    return hrs + ' giờ ' + mins + ' phút ' + secs + ' giây ';
}

function toMilis(time) {
    return time * 60 * 60 * 1000;
}

function toHour(time) {
    return (new Date(time)).getHours();
}

//Điếm dảnh và kết thúc ngày làm
exports.getAttendance = (req, res, next) => {
    if (!req.user.status) {
        return res.render('MH-1/attendance', {
            user: req.user.name,
            pageTitle: 'MH-1',
            path: '/MH-1'
        });
    } else {
        Work.findOne({
                userId: req.user
            })
            .sort({
                startAt: -1
            })
            .then(work => {
                const time = new Date();
                const workTime = time - work.startAt;
                work.endAt = time;
                work.workTime = workTime;
                work.save()
                    .then(work => {
                        const userId = req.user;
                        req.user.addToAttendance(work);
                        User.findById(userId)
                            .then(user => {
                                user.status = false;
                                user.save();
                            })
                            .then(user => {
                                req.user = user;
                            })
                            .then(result => {
                                console.log("Kết thúc phiên làm việc");
                                return res.redirect('/MH-3');
                            })
                    })
                    .catch(err => console.log(err));

            })
            .catch(err => console.log(err));
    }

}

exports.postAttendance = (req, res, next) => {
    if (!req.user.status) {
        const time = new Date();
        const location = req.body.location;
        const work = new Work({
            startAt: time,
            location: location,
            endAt: undefined,
            userId: req.user
        });
        work
            .save()
            .then(result => {
                const userId = req.user;
                User.findById(userId)
                    .then(user => {
                        user.status = true;
                        user.save();
                    })
                    .then(user => {
                        req.user = user;
                    })
                    .then(result => {
                        console.log("Điểm danh thành công");
                        return res.redirect('/');
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    } else
        return res.redirect('/');
}


exports.getAnnualLeave = (req, res, next) => {
    const remainDay = req.user.annualLeave;
    res.render('MH-1/annualLeave', {
        pageTitle: 'MH-1',
        remainDay: remainDay,
        path: '/MH-1'
    });
}

exports.postAnnualLeave = (req, res, next) => {
    let Days = 0;
    const userId = req.user;
    const remainDay = req.user.annualLeave;
    const offDay1 = req.body.offDay1;
    const offDay2 = req.body.offDay2;
    const offDay3 = req.body.offDay3;
    const offTime1 = req.body.offTime1;
    const offTime2 = req.body.offTime2;
    const offTime3 = req.body.offTime3;
    const reason = req.body.reason;
    const toDay = (Time) => {
        const equalDay = 1 / (8 / Time);
        return equalDay;
    }

    function addAnnualLeave(offDay, offTime, reason, userId) {
        const annualLeave = new AnnualLeave({
            date: offDay,
            time: offTime,
            reason: reason,
            userId: userId
        })
        annualLeave
            .save()
            .then(result => {
                const daysLeft = remainDay - Days;
                req.user.annualLeave = daysLeft;
                User.findById(userId)
                    .then(user => {
                        user.annualLeave = daysLeft;
                        user.save();
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
    const exec = new Promise(() => {
        if (offDay1) {
            Days += toDay(offTime1);
            if (remainDay - Days >= 0)
                addAnnualLeave(offDay1, offTime1, reason, userId);
            else {
                alert("Xin nghỉ phép thất bại do hết thời gian nghỉ phép")
            }
        }
        if (offDay2) {
            Days += toDay(offTime2);
            if (remainDay - Days >= 0)
                addAnnualLeave(offDay2, offTime2, reason, userId);
            else {
                alert("Xin nghỉ phép thất bại do hết thời gian nghỉ phép")
            }
        }
        if (offDay3) {
            Days += toDay(offTime3);
            if (remainDay - Days >= 0)
                addAnnualLeave(offDay3, offTime3, reason, userId);
            else {
                alert("Xin nghỉ phép thất bại do hết thời gian nghỉ phép");
            }
        }
    })

    exec.then(res.redirect('/'));
}

exports.postProfile = (req, res, next) => {
    const imageUrl = req.body.imageUrl;
    User
        .findById(req.user)
        .then(user => {
            user.imageUrl = imageUrl;
            user.save();
        })
        .then(result => {
            console.log("Thay đổi ảnh thành công");
            return res.redirect('/MH-2/profile');
        })
        .catch(err => console.log(err));
}

exports.postSalary = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());

    const annualLeave = AnnualLeave.find({
        userId: req.user
    });

    const user = User.findById(req.user);

    const work = Work.find({
            userId: req.user
        })
        .sort({
            startAt: -1
        })
        .then(data => {
            return data;
        })
        .catch(err => console.log(err));

    const attendance = User
        .findById(req.user)
        .populate('attendance.works')
        .then(data => {
            for (var i = 0; data.attendance[i]; i++) {
                const time = data.attendance[i].date.getTime();
                if (time == currDate.getTime()) {
                    return data.attendance[i];
                    break;
                }
            }
        })

    Promise.all([user, work, attendance, annualLeave]).then((values) => {
        const getUser = values[0]
        const getWork = values[1];
        const getAttendance = values[2];
        const getAnnualLeave = values[3];
        const user = req.user;
        const dates = new Date(req.body.date);
        const thisMonth = new Date().getMonth() + 1;
        const thisYear = new Date().getFullYear();
        const month = dates.getMonth() + 1;
        const year = dates.getFullYear();
        const salaryScale = user.salaryScale;
        const timePerDay = toMilis(8);
        let totalWorkTime = 0;
        let totalAnnualTime = 0;
        let overTime = 0;
        for (var i = 0; getUser.attendance[i]; i++) {
            const userData = getUser.attendance[i];
            const checkMonth = userData.date.getMonth() + 1;
            const checkYear = userData.date.getFullYear();
            const workTime = userData.workTime.getTime();
            if (checkMonth == month && checkYear == thisYear) {
                console.log("OKKKKKK");
            }
        }
        const basicIncome = 3000000;
        const extraCred = 200000;
        const timeRequiredPerMonth = timePerDay * 30;
        let missingTime = totalWorkTime - timeRequiredPerMonth;
        if (missingTime <= 0) {
            missingTime = Math.abs(missingTime);
        } else {
            missingTime = 0;
        }

        const Salary = salaryScale * basicIncome + toHour(Math.abs(overTime - missingTime)) * extraCred;
        return res.redirect('/MH-3?salary=' + Salary + "&month=" + month);
    })

}

exports.getTemperatureResgister = (req, res, next) => {
    res.render('MH-4/temperatureregister', {
        pageTitle: 'MH-4',
        path: '/MH-4'
    });
}

exports.postTemperatureResgister = (req, res, next) => {
    const hasTravel = req.body.hasTravel;
    const country = req.body.country;
    const hasContact = req.body.hasContact;
    const hasSymptoms = req.body.hasSymptoms;
    const describe = req.body.describe;
    const temperature = req.body.temperature;
    const userId = req.user;
    const temperatureRegister = new TemperatureRegister({
        hasTravel: hasTravel,
        country: country,
        hasContact: hasContact,
        hasSymptoms: hasSymptoms,
        describe: describe,
        temperature: temperature,
        userId: userId
    })
    temperatureRegister
        .save()
        .then(result => {
            console.log("Khai báo thân nhiệt thành công");
            res.redirect("/");
        })
        .catch(err => console.log(err));
}

exports.getVaccineRegister = (req, res, next) => {
    let errMessage = req.query.errMessage;
    const vaccineCount = req.user.vaccineCount;
    res.render('MH-4/vaccineregister', {
        vaccineCount: vaccineCount,
        errMessage: errMessage,
        pageTitle: 'MH-4',
        path: '/MH-4'
    })
}

exports.postVaccineRegister = (req, res, next) => {
    const vaccineType1 = req.body.vaccineType1;
    const vaccineType2 = req.body.vaccineType2;
    const vaccineId1 = req.body.vaccineId1;
    const vaccineId2 = req.body.vaccineId2;
    const date1 = req.body.date1;
    const date2 = req.body.date2;
    const location1 = req.body.location1;
    const location2 = req.body.location2;
    const userId = req.user;

    function addVaccine(vaccineType, vaccineId, date, location, userId) {
        const vaccine = new VaccineRegister({
            vaccineType: vaccineType,
            vaccineId: vaccineId,
            date: date,
            location: location,
            userId: userId
        });
        vaccine
            .save()
            .then(result => {
                res.redirect('/')
            })
            .catch(err => console.log(err));
    }

    const exec = new Promise(() => {
        if (vaccineType1 != 0 && vaccineId1 !== '' && date1 != '' && location1 != '') {
            addVaccine(vaccineType1, vaccineId1, date1, location1, userId);
            if (vaccineType2 != 0 && vaccineId2 !== '' && date2 != '' && location2 != '') {
                addVaccine(vaccineType2, vaccineId2, date2, location2, userId);
            }
        } else {
            var string = encodeURIComponent('Nhập thiếu thông tin');
            res.redirect('/MH-4/vaccine-register?errMessage=' + string);
        }
    })

    exec.then(() => {
        res.redirect('/');
    })
}

exports.getCovidReport = (req, res, next) => {
    const errMessage = req.query.errMessage;
    res.render('MH-4/covidreport', {
        errMessage: errMessage,
        user: req.user,
        pageTitle: 'Đăng ký dương tính',
        path: '/MH-4'
    })
}

exports.postCovidReport = (req, res, next) => {
    const address = req.body.address;
    const wasF0 = req.body.wasF0;
    const quickTest = req.body.quickTest;
    const pcr = req.body.pcr;
    const userId = req.user;

    if (address != '') {
        let month = '';
        let dateTest = '';
        let datepcr = '';
        if (wasF0)
            month = req.body.month;
        if (quickTest)
            dateTest = req.body.dateTest;
        if (pcr)
            datepcr = req.body.datepcr;
        const covidReport = new CovidReport({
            address: address,
            wasF0: wasF0,
            month: month,
            quickTest: quickTest,
            dateTest: dateTest,
            pcr: pcr,
            datepcr: datepcr,
            userId: userId
        })
        covidReport
            .save()
            .then(result => {
                res.redirect('/');
            })
            .catch(err => console.log(err));
    } else {
        var string = encodeURIComponent('Nhập thiếu thông tin');
        res.redirect('/MH-4/covid-report?errMessage=' + string);
    }

}

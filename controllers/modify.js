//Then6m các Schema
const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');
const TemperatureRegister = require('../models/temperatureregister');
const VaccineRegister = require('../models/vaccineregister');
const CovidReport = require('../models/covidreport');

//Thêm các Functions tự viết
const exFunc = require('../util/extraFunction');

//Thêm gói Alert
const alert = require('alert');

//Điếm danh và kết thúc ngày làm
exports.getAttendance = (req, res, next) => {
    //Trả về trạng thái chưa điểm danh
    if (!req.user.status) {
        return res.render('MH-1/attendance', {
            user: req.user.name,
            pageTitle: 'MH-1',
            path: '/MH-1'
        });
    }

    //Trả về trạng thái đã điểm danh
    else {
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
                                return res.redirect('/MH-1/history');
                            })
                    })
                    .catch(err => console.log(err));

            })
            .catch(err => console.log(err));
    }

}

//Thực hiện thêm điểm danh
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

//render trang AnnualLeave
exports.getAnnualLeave = (req, res, next) => {
    const remainDay = req.user.annualLeave;
    res.render('MH-1/annualLeave', {
        pageTitle: 'MH-1',
        remainDay: remainDay,
        path: '/MH-1'
    });
}

//Thực hiện thêm data vào AnnualLeave
exports.postAnnualLeave = (req, res, next) => {

    //Khai báo biến
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

    //Tính số ngày
    const timeEqualDay = (Time) => {
        return 1 / (8 / Time); //Vì 1 ngày tương đương với 8 giờ
    }

    //Tạo hàm thêm ngày nghỉ
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

    //Tạo hàm vào database
    function addAnnualLeaveToDB(offDay, offTime, reason, userId) {
        if (offDay) {
            Days += timeEqualDay(offTime); //Tính số ngày

            //Thêm ngày khi vẫn còn ngày nghỉ
            if (remainDay - Days >= 0)
                addAnnualLeave(offDay, offTime, reason, userId);
            else {
                alert("Xin nghỉ phép thất bại do hết thời gian nghỉ phép")
            }
        }
    }

    //Thêm thông tin
    addAnnualLeaveToDB(offDay1, offTime1, reason, userId);
    addAnnualLeaveToDB(offDay2, offTime2, reason, userId);
    addAnnualLeaveToDB(offDay3, offTime3, reason, userId);
    res.redirect('/');
}

//thực hiện thay đổi hình ảnh
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

//Thực hiện tính toán salary
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
            return data.attendance;
        })

    //Lấy data từ các Promise cần dùng cho vào 1 mảng
    Promise.all([user, work, attendance, annualLeave])
        //Truyển mảng vừa mới nhận được sau khi có đủ data
        .then((values) => {

            //Đặt tên cho các phần tử của mảng
            const getUser = values[0]
            const getWork = values[1];
            const getAttendance = values[2];
            const getAnnualLeave = values[3];

            //Khai báo biến
            const user = req.user;
            const salaryScale = user.salaryScale;
            const basicIncome = 3000000;
            const extraCred = 200000;
            const dates = new Date(req.body.date);
            const thisMonth = new Date().getMonth() + 1;
            const thisYear = new Date().getFullYear();
            const month = dates.getMonth() + 1;
            const year = dates.getFullYear();
            const timeRequiredPerMonth = 8 * 30;
            let totalWorkTime = 0;
            let totalAnnualTime = 0;
            let totalOverTime = 0;

            //Tính tổng giờ làm, ngày nghỉ, giờ làm thêm của tháng
            for (var i = 0; getUser.attendance[i]; i++) {

                //Đặt tên biến
                const userData = getUser.attendance[i];
                const checkMonth = userData.date.getMonth() + 1;
                const checkYear = userData.date.getFullYear();
                const workTime = exFunc.msToHours(userData.workTime.getTime());
                const timeRequiredPerDay = exFunc.toMilis(8);
                let offTime = userData.timeLeaving;

                //Cập nhật tổng thời gian làm việc và ngày nghỉ
                if (checkMonth == month && checkYear == thisYear) {
                    totalWorkTime += workTime;
                    totalAnnualTime += offTime;

                    //Cập nhật giờ làm thêm
                    if ((workTime + offTime) > timeRequiredPerDay) {
                        totalOverTime = workTime + offTime - timeRequiredPerDay;
                    }
                }

            }

            //Tính thời gian làm thiếu
            let missingTime = totalWorkTime + totalAnnualTime - timeRequiredPerMonth;
            if (missingTime <= 0) {
                missingTime = Math.abs(missingTime);
            } else {
                missingTime = 0;
            }

            //Tính tiền lương và hiển thị công thức tính
            const salary = salaryScale * basicIncome + (totalOverTime - missingTime) * extraCred;
            const fomula = encodeURIComponent(salaryScale + ' * ' + basicIncome + ' + (' + totalOverTime + '- (' + totalWorkTime + "+" + totalAnnualTime + "-" + timeRequiredPerMonth + ')) *    ' + extraCred);
            res.redirect('/MH-3?salary=' + salary + '&fomula=' + fomula)
        })

}

//render trang temperatureRegister
exports.getTemperatureResgister = (req, res, next) => {
    res.render('MH-4/temperatureregister', {
        pageTitle: 'MH-4',
        path: '/MH-4'
    });
}

//Thực hiện thêm data vào TemperatureRegister
exports.postTemperatureResgister = (req, res, next) => {

    //Khai báo biến
    const hasTravel = req.body.hasTravel;
    const country = req.body.country;
    const hasContact = req.body.hasContact;
    const hasSymptoms = req.body.hasSymptoms;
    const describe = req.body.describe;
    const temperature = req.body.temperature;
    const userId = req.user;

    //Lưu data
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

//render trang VaccineRegister
exports.getVaccineRegister = (req, res, next) => {
    //Khai báo biến
    let errMessage = req.query.errMessage; //Lấy thông tin lỗi
    const vaccineCount = req.user.vaccineCount;

    //render
    res.render('MH-4/vaccineregister', {
        vaccineCount: vaccineCount,
        errMessage: errMessage,
        pageTitle: 'MH-4',
        path: '/MH-4'
    })
}

//Thực hiện thêm data vào VaccineRegister
exports.postVaccineRegister = (req, res, next) => {
    //Khai báo biến
    const vaccineType1 = req.body.vaccineType1;
    const vaccineType2 = req.body.vaccineType2;
    const vaccineId1 = req.body.vaccineId1;
    const vaccineId2 = req.body.vaccineId2;
    const date1 = req.body.date1;
    const date2 = req.body.date2;
    const location1 = req.body.location1;
    const location2 = req.body.location2;
    const userId = req.user;

    //tạo hàm thêm thông tin vaccine
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
            .catch(err => console.log(err));
    }

    //Nếu data ko lỗi thì thêm Vaccine
    if (vaccineType1 != 0 && vaccineId1 !== '' && date1 != '' && location1 != '') {
        addVaccine(vaccineType1, vaccineId1, date1, location1, userId);
        if (vaccineType2 != 0 && vaccineId2 !== '' && date2 != '' && location2 != '') {
            addVaccine(vaccineType2, vaccineId2, date2, location2, userId);
        }
        res.redirect('/');
    }
    //Nếu lỗi thì trả về báo lỗi
    else {
        var string = encodeURIComponent('Nhập thiếu thông tin');
        res.redirect('/MH-4/vaccine-register?errMessage=' + string);
    }
}

//render trang CovidReport
exports.getCovidReport = (req, res, next) => {
    const errMessage = req.query.errMessage;
    res.render('MH-4/covidreport', {
        errMessage: errMessage,
        user: req.user,
        pageTitle: 'Đăng ký dương tính',
        path: '/MH-4'
    })
}

//Thực hiện thêm data vào covidReport
exports.postCovidReport = (req, res, next) => {

    //Khai báo biến
    const address = req.body.address;
    const wasF0 = req.body.wasF0;
    const quickTest = req.body.quickTest;
    const pcr = req.body.pcr;
    const userId = req.user;

    //Thêm data nếu không co lỗi thiếu thông tin
    if (address != '') {
        let month = '';
        let dateTest = '';
        let datepcr = '';

        //Kiểm tra data từ checkbox
        if (wasF0)
            month = req.body.month;
        if (quickTest)
            dateTest = req.body.dateTest;
        if (pcr)
            datepcr = req.body.datepcr;

        //Lưu thông tin
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
    }
    //Trả về lỗi khi thiếu data
    else {
        var string = encodeURIComponent('Nhập thiếu thông tin');
        res.redirect('/MH-4/covid-report?errMessage=' + string);
    }

}

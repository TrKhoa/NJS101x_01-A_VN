//Then6m các Schema
const fs = require('fs');
const path = require('path');
const pdfKit = require('pdfkit');
const moment = require('moment');
const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');
/*
const TemperatureRegister = require('../models/temperatureregister');
const VaccineRegister = require('../models/vaccineregister');
const CovidReport = require('../models/covidreport');
*/
const Pdf = require('pdfkit');

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
            userRoll: req.user.roll,
            path: '/MH-1'
        });
    }

    //Trả về trạng thái đã điểm danh
    else {
        Work.findOne({
                userId: req.user
            })
            .sort({
                startAt: -1 //Sắp xếp theo desc
            })
            .then(work => {
                //Khai bao biến
                const time = new Date();
                const workTime = time - work.startAt;
                work.endAt = time;
                work.workTime = workTime;
                //lưu thông tin làm việc
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
    //Trả về trạng thái chưa điểm danh
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
    }
    //Trả về trạng thái đã điểm danh
    else
        return res.redirect('/');
}

//render trang AnnualLeave
exports.getAnnualLeave = (req, res, next) => {
    const remainDay = req.user.annualLeave; //Số ngày nghỉ còn lại
    res.render('MH-1/annualLeave', {
        pageTitle: 'MH-1',
        remainDay: remainDay,
        userRoll: req.user.roll,
        path: '/MH-1'
    });
}

//Thực hiện thêm data vào AnnualLeave
exports.postAnnualLeave = (req, res, next) => {

    //Khai báo biến
    let Days = 0;
    const userId = req.user;
    const remainDay = req.user.annualLeave;
    const offDay = req.body.offDay.split(' — ');
    //const offDay2 = req.body.offDay2;
    //const offDay3 = req.body.offDay3;
    const offTime = req.body.offTime;
    //const offTime2 = req.body.offTime2;
    //const offTime3 = req.body.offTime3;
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
            offDay.forEach(date=>{
                Days += timeEqualDay(offTime); //Tính số ngày

                //Thêm ngày khi vẫn còn ngày nghỉ
                if (remainDay - Days >= 0)
                    addAnnualLeave(new Date(date), offTime, reason, userId);
                else {
                    alert("Xin nghỉ phép thất bại do hết thời gian nghỉ phép")
                }
            })
        }
    }

    //Thêm thông tin
    addAnnualLeaveToDB(offDay, offTime, reason, userId);
    res.redirect('/');
}

//thực hiện thay đổi hình ảnh
exports.postProfile = (req, res, next) => {
    const img = req.file;
    //Lưu Url image
    if(!img)
    {
        res.render('MH-2/profile', {
            user: req.user,
            edit: true,
            errorMessage: "Định dạng hình ảnh không hợp lệ",
            pageTitle: 'Profile',
            userRoll: req.user.roll,
            path: '/MH-2'
        });
    }
    else
    {
        User
            .findById(req.user)
            .then(user => {
                user.imageUrl = img.path;
                user.save();
            })
            .then(result => {
                return res.redirect('profile');
            })
            .catch(err => console.log(err));
    }
}

//Thực hiện tính toán salary
exports.postSalary = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());

    //Tìm ngày nghỉ
    const annualLeave = AnnualLeave.find({
        userId: req.user
    });

    //Tìm user
    const user = User.findById(req.user);

    //Tìm Work
    const work = Work.find({
            userId: req.user
        })
        .then(data => {
            return data;
        })
        .catch(err => console.log(err));

    //tìm attendance
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
                const timeRequiredPerDay = 8;
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
            const fomula = encodeURIComponent(salaryScale + ' * ' + basicIncome + ' + (' + totalOverTime + ' - ' + missingTime + ') *    ' + extraCred);

            //Trả về data nếu như lương không âm
            if (salary > 0) {
                res.redirect('/MH-3?salary=' + salary + '&fomula=' + fomula);
            } else {
                res.redirect('/MH-3?salary=' + 0 + '&fomula=' + fomula);
            }
        })

}

//render trang temperatureRegister
exports.getTemperatureResgister = (req, res, next) => {
    res.render('MH-4/temperatureregister', {
        pageTitle: 'MH-4',
        userRoll: req.user.roll,
        path: '/MH-4'
    });
}

//Thực hiện thêm data vào TemperatureRegister
exports.postTemperatureResgister = (req, res, next) => {

    //Khai báo biến
    const temperatureDate = req.body.temperatureDate;
    const temperature = req.body.temperature;
    const userId = req.user;

    //Lưu data
    const temperatureRegister = {
        temperatureDate: temperatureDate,
        temperature: temperature
    }
    User.findById(userId)
        .update(temperatureRegister)
        .then(result => {
            console.log("Khai báo thân nhiệt thành công");
            res.redirect("/MH-4");
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
        userRoll: req.user.roll,
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

    function Store(vaccineType, vaccineId, vaccineDate, vaccineLocation) {
        return {
            vaccineType: vaccineType,
            vaccineId: vaccineId,
            vaccineDate: vaccineDate,
            vaccineLocation: vaccineLocation
        }
    }

    User.findById(userId).then(result => {
        if(vaccineType1 != 0 && vaccineId1 !== '' && date1 != '' && location1 != '')
        {
            const vaccineData = [...result.vaccine,Store(vaccineType1,vaccineId1,date1,location1 )];
            result.updateOne({vaccine:vaccineData, vaccineCount: result.vaccineCount+1}).then(result=>{console.log("Them thanh cong")});
                if(vaccineType2 != 0 && vaccineId2 !== '' && date2 != '' && location2 != '')
                {
                    const vaccineData2 = [...vaccineData,Store(vaccineType2,vaccineId2,date2,location2 )];
                    result.updateOne({vaccine:vaccineData2, vaccineCount: result.vaccineCount+2}).then(result=>{console.log("Them thanh cong")});
                }
        }
    });
    return res.redirect("/MH-4");
}

//render trang CovidReport
exports.getCovidReport = (req, res, next) => {
    const errMessage = req.query.errMessage;
    res.render('MH-4/covidreport', {
        errMessage: errMessage,
        user: req.user,
        pageTitle: 'Đăng ký dương tính',
        userRoll: req.user.roll,
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
        let datePcr = '';

        //Kiểm tra data từ checkbox
        if (wasF0 == 1)
            month = req.body.month;
        if (quickTest == 1)
            dateTest = req.body.dateTest;
        if (pcr == 1)
            datePcr = req.body.datePcr;
        //Lưu thông tin
        const covidReport = {
            quarantineAddress: address,
            wasF0: wasF0,
            monthF0: month,
            quickTest: quickTest,
            dateTest: dateTest,
            pcr: pcr,
            datePcr: datePcr
        };
        User.findById(userId).updateOne(covidReport)
            .then(result => {
                res.redirect('/MH-4');
            })
            .catch(err => console.log(err));
    }
    //Trả về lỗi khi thiếu data
    else {
        var string = encodeURIComponent('Nhập thiếu thông tin');
        res.redirect('/MH-4/covid-report?errMessage=' + string);
    }
}

exports.getPdf = (req,res,next) => {
    const userId = req.params.userId;
    if(req.user.roll >1)
    {
        User.findById(req.user._id).then(result=>{
            const employee = result.managerOf;
            employee.forEach(e=>{
                if(e==userId){
                    const pdfName = "covid-"+userId+".pdf";
                    const pdfPath = path.join('covid',pdfName);
                    const pdf = new pdfKit();
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition','attachment; filename="'+pdfName+'"');
                    pdf.pipe(fs.createWriteStream(pdfPath));
                    pdf.pipe(res);
                    User.findById(userId).then(result => {
                        pdf.fontSize('22').text('Ten nhan vien: ' + result.name);
                        const abc = moment(result.temperatureDate).locale('vn').format("DD/MM/YYYY");
                        if(result.temperature)
                        {

                            pdf.fontSize('16').text('Than nhiet: ' + result.temperature);
                            pdf.fontSize('16').text('Ngay do: ' + '3/5/2000');
                        }
                        if(result.vaccine.length>0)
                        {
                            const vaccine = result.vaccine;
                            function vaccineName(vaccineType) {
                                switch(vaccineType)
                                {
                                    case 1:
                                        return "Astrazeneca";
                                    case 2:
                                        return "Pfizer";
                                }
                            }
                            pdf.text('So mui da tiem: ' + result.vaccineCount);
                            for(var i = 0; i< vaccine.length;i++)
                            {
                                pdf.fontSize('16').text('- Mui thu ' + (i+1) + ': ');
                                pdf.fontSize('16').text('   + Ten Vaccine: ' + vaccineName(vaccine[i].vaccineType));
                                pdf.fontSize('16').text('   + Dia chi tiem: ' + vaccine[i].vaccineLocation);
                                pdf.fontSize('16').text('   + Ngay tiem: ' + moment(vaccine[i].vaccineDate).format("DD/MM/YYYY"));
                            }
                        }
                        if(result.quarantineAddress)
                        {
                            pdf.fontSize('16').text('Dia chi cach ly: ' + result.quarantineAddress);
                            if(result.wasF0)
                                pdf.fontSize('16').text('So thang tung bi F0: ' + moment(result.monthF0).format("DD/MM/YYYY"));
                            if(result.quickTest)
                                pdf.fontSize('16').text('Ngay test nhanh duong tinh: ' + moment(result.dateTest).format("DD/MM/YYYY"));
                            if(result.pcr)
                                pdf.fontSize('16').text('Ngay RT-PCR duong tinh: ' + moment(result.datePcr).format("DD/MM/YYYY"));
                        }
                    }).then(result=>pdf.end());
                }
                else {
                    return res.redirect('/MH-4');
                }
            })
        })
    } else {
        res.redirect('/MH-4');
    }
}

exports.getHistoryDelete = (req,res,next) => {
    const userId = req.query.userData || null;
    const userWorkId = req.query.del || null;
    if(userWorkId)
    {
        const work = Work.findById(userWorkId);
        const user = User.findById(userId);
        Promise.all([user,work]).then(val => {
            const userData = val[0];
            const workData = val[1];
            const attendance= userData.attendance;
            for(var k = 0; k < attendance.length;k++)
            {
                 if(attendance[k].date.toDateString() == workData.startAt.toDateString())
                 {
                     const attendanceWorks = attendance[k].works;
                     for(var i = 0;i<attendanceWorks.length;i++)
                     {
                         if(attendanceWorks[i]==userWorkId)
                         {
                             attendance[k].workTime = attendance[k].workTime - workData.workTime;
                             attendanceWorks.splice(i,1);
                             const filter = { _id: userId  };
                             const update = { attendance:  attendance};
                             User.findOneAndUpdate(filter,update).then(result => {
                                 Work.deleteOne({ _id: userWorkId }).then(result => {
                                     return res.redirect('/MH-5?userData='+userId);
                                 })
                             })
                         }
                     }
                 }
            }
        })
    }
}

exports.getFrozen = (req,res,next) =>{
    const userId = req.query.userId || null;
    const month = +req.query.month || null;
    if(userId && month)
    {
        User.findById(userId).then(user => {
            if(user != null)
            {
                const frozen = user.frozen;
                const thisYear = new Date().getFullYear();
                if(frozen.year == thisYear)
                {
                    const newMonth = [...frozen.month];
                    if(newMonth.indexOf(month) == -1)
                    {
                        newMonth.push(month);
                        const filter = { _id: userId };
                        const update = { frozen: {month: newMonth, year: thisYear}};
                        User.updateOne(filter,update).then(result => {
                            return res.redirect('/MH-5?userData='+userId);
                        })
                    }
                    else
                    {
                        return res.redirect('/MH-5?userData='+userId);
                    }
                }
                else
                {
                    const filter = { _id: userId };
                    const update = { month: [month], year: thisYear};
                    User.updateOne(filter,update).then(result => {
                        return res.redirect('/MH-5?userData='+userId);
                    })
                }
            }
            else
            {
                return res.redirect('/MH-5');
            }
        })
    }

}

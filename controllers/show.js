//Thêm các Schema
const moment = require('moment');
const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');
const TemperatureRegister = require('../models/temperatureregister');
const VaccineRegister = require('../models/vaccineregister');
const CovidReport = require('../models/covidreport');

//Thêm các Functions tự viết
const exFunc = require('../util/extraFunction');

const currDate = new Date(); //Khai báo ngày hiện tại

//Render trang index(MH-1)
exports.getIndex = (req, res, next) => {
    res.render('MH-1/index', {
        name: req.user.name,
        working: req.user.status,
        pageTitle: 'MH-1',
        userRoll: req.user.roll,
        path: '/MH-1'
    });
}

//Render trang history(MH-1)
exports.getTodayHistory = (req, res, next) => {

    //Lấy danh sách works
    User
        .findById(req.user)
        .populate('attendance.works') //liên kết
        .then(data => {
            return data.attendance;
        })
        .then(data => {
            let history;
            let workTime;
            //Tìm history theo ngày
            for (var i = 0; data[i]; i++) {
                if (data[i].date.toDateString() == currDate.toDateString()) {
                    history = data[i].works.sort().reverse();
                    workTime = exFunc.msToTime(data[i].workTime.getTime())
                    break;
                }
            }

            //render
            res.render('MH-1/history', {
                user: req.user.name,
                data: history,//Sắp xếp trả theo giờ làm gần nhất
                date: exFunc.dateFormat(currDate),
                workTime: workTime,
                pageTitle: 'MH-1',
                userRoll: req.user.roll,
                path: '/MH-1'
            });


        })
}

//Render trang profile(MH-2)
exports.getProfile = (req, res, next) => {
    let editMode = req.query.edit; //Lấy edit từ url
    User
        .findById(req.user)
        .then(user => {
            //render
            res.render('MH-2/profile', {
                user: user,
                edit: editMode,
                errorMessage: null,
                pageTitle: 'Profile',
                userRoll: req.user.roll,
                path: '/MH-2'
            });
        })
        .catch(err => console.log(err));
}

//Render trang Dashboard(MH-3)
exports.getDashboard = (req, res, next) => {

    const page = +req.query.page || 1;
    const itemPerPage = +req.query.itemPerPage || 1;
    let totalWorks = 0;
    //Lấy data từ collection AnnualLeave
    const annualLeave = AnnualLeave.find({
        userId: req.user
    });
    //Lấy data từ collection User
    const user = User.findById(req.user);

    //Lấy data từ collection Work
    const work = Work.find({
            userId: req.user
        })
        .countDocuments()
        .then(result => {
            totalWorks = result;
            return Work.find({
                    userId: req.user
                })
                .sort({
                    startAt: -1 //Xếp theo thứ tự Desc
                })
                .skip((page - 1) * itemPerPage)
                .limit(itemPerPage)
                .then(data => {
                    return data;
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    //Lấy data từ collection Attendance
    const attendance = User
        .findById(req.user)
        .populate('attendance.works') //điền dữ liệu bên trong tham chiếu
        .then(data => {
            for (var i = 0; data.attendance[i]; i++) {
                const time = data.attendance[i].date.getTime();
                if (time == exFunc.toUTC(currDate).getTime()) {
                    return data.attendance[i];
                    break;
                }
            }
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
            const month = req.query.month;
            const salary = req.query.salary;
            const fomula = req.query.fomula;
            let workTime = 0;
            let timeLeaving = 0;
            let overTime = 0;
            const latestWork = getWork[0];

            //Nếu có data từ attendance thì gán data
            if (getAttendance) {
                workTime = getAttendance.workTime.getTime();
                timeLeaving = getAttendance.timeLeaving;
            }

            /* Nếu muốn cộng thêm thời gian nghỉ
            //Nếu hôm nay có xin nghỉ
            if (timeLeaving > 0) {
                workTime += exFunc.toMilis(timeLeaving);
            }
            */

            //Tính giờ làm thêm nếu có
            if (workTime > exFunc.toMilis(8)) {
                overTime = workTime - exFunc.toMilis(8);
            }
            const shownDate = currDate.getDate() + "/" + (currDate.getMonth() + 1) + "/" + currDate.getFullYear();

            //render
            res.render('MH-3/dashboard', {
                user: getUser,
                work: getWork,
                itemPerPage: itemPerPage,
                currentPage: page,
                hasNextPage: itemPerPage * page < totalWorks,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalWorks / itemPerPage),
                date: shownDate,
                workTime: workTime,
                overTime: overTime,
                leaveTime: timeLeaving,
                lastestWork: latestWork,
                annualLeave: getAnnualLeave,
                month: month,
                salary: salary,
                fomula: fomula,
                pageTitle: 'MH-3',
                userRoll: req.user.roll,
                path: '/MH-3'
            });
        });

}

//Render trang Covid(MH-4)
exports.getCovid = (req, res, next) => {
    const userId = req.user;
    if(req.user.roll <2)
    {
        res.render('MH-4/main', {
            userData: userId,
            pageTitle: 'Covid',
            userRoll: req.user.roll,
            path: '/MH-4'
        });
    } else {
        User.findById(userId).populate('managerOf').then(result=>
        {
            const userList = result.managerOf;
            res.render('MH-4/main', {
                userData: userId,
                userList: userList,
                pageTitle: 'Covid',
                userRoll: req.user.roll,
                path: '/MH-4'
            });
        });
    }

}

exports.getEmployeeWork = (req, res, next) => {
    const userData = req.query.userData || null;
    const userId = req.user;
    User.findById(userId).populate('managerOf').populate('managerOf.attendance.works').then(result=>
    {
        let isExist = 0;
        const userList = result.managerOf;
        for(var i = 0;i<userList.length;i++)
        {
            if(userList[i]._id==userData)
            {
                isExist = 1;
                const attendance = userList[i].attendance;
                if(userList[i].attendance[attendance.length-1]){
                    const works = userList[i].attendance[attendance.length-1].works;
                }
                else {
                    const works = null;
                }
                let overTime = 0;
                const annualLeave = AnnualLeave.find({userId: userData}).then(result => {
                    let time = 0;
                    for(var i =0; i < result.length; i++)
                    {
                        const checkDate = moment(result[i].date).format('L');
                        const today = moment().format('L');
                        if(checkDate==today){
                            time += result[i].time;
                        }
                    }
                    if(time===0)
                        return null;
                    return time;
                })
                const work = Work.find({userId: userData}).sort({
                    startAt: -1 //Xếp theo thứ tự Desc
                });
                Promise.all([userList[i],annualLeave,work,attendance]).then(val =>
                {
                    const userDatas = val[0];
                    const annualLeaves = val[1];
                    const works = val[2];
                    const attendances = val[3][val[3].length-1];
                    let overTime = 0;
                    let lastWorkTime =  null;
                    let workTime = null;
                    let totalWorkTime = null;
                    if(works.length>0){
                        let lastWorkTime = works[0].workTime;
                        let workTime = works[0].workTime;
                        let workStart = works[0].startAt;
                        let workEnd = works[0].workEnd;
                    }
                    if(val[3].length>0)
                    {
                        let totalWorkTime = attendances.workTime;
                        if(moment(attendances.workTime).hour() - 7 > 8)
                            overTime = moment(attendances.workTime).hour() - 15;
                    }
                    return res.render('MH-5/main', {
                        userData: userDatas,
                        userWork: works,
                        lastWorkTime: lastWorkTime,
                        workTime: totalWorkTime,
                        annualLeave: annualLeaves,
                        userList: userList,
                        date: new Date(),
                        overTime: overTime,
                        pageTitle: 'MH-5',
                        userRoll: req.user.roll,
                        path: '/MH-5'
                    });
                })
            }
        }
        if(isExist==0){
            return res.render('MH-5/main', {
                userData: userData,
                userList: userList,
                pageTitle: 'MH-5',
                userRoll: req.user.roll,
                path: '/MH-5'
            });
        }

    });
}

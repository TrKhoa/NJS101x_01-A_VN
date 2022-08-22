//Thêm các Schema
const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');

//Thêm các Functions tự viết
const exFunc = require('../util/extraFunction');

const currDate = new Date(); //Khai báo ngày hiện tại

//Render trang index(MH-1)
exports.getIndex = (req, res, next) => {
    res.render('MH-1/index', {
        name: req.user.name,
        working: req.user.status,
        pageTitle: 'MH-1',
        path: '/MH-1'
    });
}

//Render trang history(MH-1)
exports.getTodayHistory = (req, res, next) => {

    User
        .findById(req.user)
        .populate('attendance.works')
        .then(data=>{
            return data.attendance;
        })
        .then(data => {
            let history = [];

            for(var i=0; data[i]; i++){
                if(data[i].date.toDateString() == currDate.toDateString()){
                    history = data[i];
                    break;
                }
            }

            console.log(data);
            res.render('MH-1/history', {
                user: req.user.name,
                data: history.works.sort().reverse(),
                date: exFunc.dateFormat(currDate),
                workTime: exFunc.msToTime(history.workTime.getTime()),
                pageTitle: 'MH-1',
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
                pageTitle: 'Profile',
                path: '/MH-2'
            });
        })
        .catch(err => console.log(err));
}

//Render trang Dashboard(MH-3)
exports.getDashboard = (req, res, next) => {

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
        .sort({
            startAt: -1 //Xếp theo thứ tự Desc
        })
        .then(data => {
            return data;
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
            //Nếu hôm nay có xin nghỉ
            if (timeLeaving > 0) {
                workTime += exFunc.toMilis(timeLeaving);
            }
            //Tính giờ làm thêm nếu có
            if (workTime > exFunc.toMilis(8)) {
                overTime = workTime - exFunc.toMilis(8);
            }
            const shownDate = currDate.getDate() + "/" + (currDate.getMonth() + 1) + "/" + currDate.getFullYear();
            //render
            res.render('MH-3/dashboard', {
                user: getUser,
                work: getWork,
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
                path: '/MH-3'
            });
        });

}

//Render trang Covid(MH-4)
exports.getCovid = (req, res, next) => {
    res.render('MH-4/main', {
        pageTitle: 'Covid',
        path: '/MH-4'
    })
}

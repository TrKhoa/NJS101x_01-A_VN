const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');

function msToTime(time) {
    var ms = time % 1000;
    time = (time - ms) / 1000;
    var secs = time % 60;
    time = (time - secs) / 60;
    var mins = time % 60;
    var hrs = (time - mins) / 60;
    return hrs + ' giờ ' + mins + ' phút ' + secs + ' giây ';
}

function dateFormat(date){
    return date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()
}

function toHour(time) {
    return (new Date(time)).getHours();
}

function toMilis(time) {
    return time * 60 * 60 * 1000;
}

exports.getIndex = (req, res, next) => {
    res.render('MH-1/index', {
        working: req.user.status,
        pageTitle: 'MH-1',
        path: '/MH-1'
    });
}

exports.getTodayHistory = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());

    const annualLeave = AnnualLeave.find({userId: req.user});

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
    .then(data=>{
        for(var i=0;data.attendance[i];i++){
            const time = data.attendance[i].date.getTime();
            if(time == currDate.getTime()){
                return data.attendance[i];
                break;
            }
        }
    })

    Promise.all([work,attendance]).then((values) => {
        const getWork = values[0];
        const getAttendance = values[1];;
        let workTime = 0;
        let timeLeaving = 0;
        let overTime = 0;
        const latestWork = getWork[0];
        if(getAttendance){
            workTime = getAttendance.workTime.getTime();
            timeLeaving = getAttendance.timeLeaving;
        }
        if(timeLeaving>0){
            workTime += toMilis(timeLeaving);
        }
        if (workTime > toMilis(8)) {
            overTime = workTime - toMilis(8);
        }
        res.render('MH-1/history', {
            user: req.user.name,
            data: getWork,
            date: dateFormat(currDate),
            workTime: msToTime(workTime),
            pageTitle: 'MH-1',
            path: '/MH-1'
        });
    })

}

exports.getProfile = (req, res, next) => {
    let editMode = req.query.edit;
    User
        .findById(req.user)
        .then(user => {
            res.render('MH-2/profile', {
                user: user,
                edit: editMode,
                pageTitle: 'Profile',
                path: '/MH-2'
            });
        })
        .catch(err => console.log(err));
}

exports.getDashboard = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());

    const annualLeave = AnnualLeave.find({userId: req.user});

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
    .then(data=>{
        for(var i=0;data.attendance[i];i++){
            const time = data.attendance[i].date.getTime();
            if(time == currDate.getTime()){
                return data.attendance[i];
                break;
            }
        }
    })

    Promise.all([user,work,attendance,annualLeave]).then((values) => {
        const getUser = values[0]
        const getWork = values[1];
        const getAttendance = values[2];
        const getAnnualLeave = values[3];
        const month = req.query.month;
        const salary = req.query.salary;
        let workTime = 0;
        let timeLeaving = 0;
        let overTime = 0;
        const latestWork = getWork[0];
        if(getAttendance){
            workTime = getAttendance.workTime.getTime();
            timeLeaving = getAttendance.timeLeaving;
        }
        if(timeLeaving>0){
            workTime += toMilis(timeLeaving);
        }
        if (workTime > toMilis(8)) {
            overTime = workTime - toMilis(8);
        }
        const shownDate = currDate.getDate() + "/" + (currDate.getMonth() + 1) + "/" + currDate.getFullYear();
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
            pageTitle: 'MH-3',
            path: '/MH-3'
        });
    });

}

exports.getCovid = (req, res, next) => {
    res.render('MH-4/main', {
        pageTitle: 'Covid',
        path: '/MH-4'
    })
}

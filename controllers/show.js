const Work = require('../models/work');
const User = require('../models/user');
const AnnualLeave = require('../models/annualleave');

exports.getIndex = (req, res, next) => {
    res.render('MH-1/index', {
        working: req.user.status,
        pageTitle: 'MH-1',
        path: '/MH-1'
    });
}

exports.getTodayHistory = (req, res, next) => {
    const date = new Date().toDateString();
    const currDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    const nextDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() + 1);
    Work.find({
            userId: req.user,
            startAt: {
                $gte: currDate,
                $lte: nextDate
            }
        })
        .sort({
            startAt: -1
        })
        .then(data => {
            let i = 0;
            let workTime = 0;
            while (data[i]) {
                workTime += data[0].workTime.getMinutes();
                i++;
            }
            res.render('MH-1/history', {
                user: req.user.name,
                data: data,
                date: currDate,
                workTime: workTime,
                pageTitle: 'MH-1',
                path: '/MH-1'
            });
        })
        .catch(err => console.log(err));
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
/*
exports.getDashboard = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());
    let annualLeave = [];
    let leaveTime = [];
    AnnualLeave.
    find({userId:req.user})
    .then(result=>{
        for(var i=0;result[i];i++){
            annualLeave = annualLeave.concat(result[i].date);
            leaveTime = leaveTime.concat(result[i].time);
        }
    })
    .then(result=>{
        Work.find({
                userId: req.user
            })
            .sort({
                startAt: -1
            })
            .then(data => {
                function hour(time){
                    return time*60*60*1000;
                }
                let workTime = 0;
                let overTime = 0;
                const latestWork = data[0];
                for(var i = 0; data[i] && data[i].workTime;i++){
                    if(data[i].startAt > currDate)
                        workTime += data[i].workTime.getTime();
                }
                for(var i = 0; annualLeave[i] && leaveTime[i];i++){
                    if(currDate.toDateString() == annualLeave[i].toDateString()){
                        const time = hour(leaveTime[i]);
                        workTime = workTime + time;
                    }
                }
                if(workTime>hour(8)){
                    overTime = workTime - hour(8);
                }
                const shownDate = currDate.getDate()+"/"+(currDate.getMonth()+1)+"/"+currDate.getFullYear();
                res.render('MH-3/dashboard', {
                    user: req.user.name,
                    data: data,
                    date: shownDate,
                    workTime: workTime,
                    overTime: overTime,
                    lastestWork: latestWork,
                    annualLeave: annualLeave,
                    leaveTime: leaveTime,
                    pageTitle: 'MH-3',
                    path: '/MH-3'
                });
            })
            .catch(err => console.log(err));
    })
    .catch(err=>console.log(err));
}
*/
/*
exports.getDashboard = (req, res, next) => {
    const currDate = new Date(new Date().toDateString());
    const annualLeave =[];

    Work.find({
            userId: req.user
        })
        .sort({
            startAt: -1
        })
        .then(data => {
            function hour(time) {
                return time * 60 * 60 * 1000;
            }
            let workTime = 0;
            let overTime = 0;
            const latestWork = data[0];
            for (var i = 0; data[i] && data[i].workTime; i++) {
                if (data[i].startAt > currDate)
                    workTime += data[i].workTime.getTime();
            }
            for (var i = 0; annualLeave[i] && leaveTime[i]; i++) {
                if (currDate.toDateString() == annualLeave[i].toDateString()) {
                    const time = hour(leaveTime[i]);
                    workTime = workTime + time;
                }
            }
            if (workTime > hour(8)) {
                overTime = workTime - hour(8);
            }
            const shownDate = currDate.getDate() + "/" + (currDate.getMonth() + 1) + "/" + currDate.getFullYear();
            res.render('MH-3/dashboard', {
                user: req.user.name,
                data: data,
                date: shownDate,
                workTime:0,
                overTime: overTime,
                lastestWork: latestWork,
                annualLeave: 0,
                leaveTime: 0,
                pageTitle: 'MH-3',
                path: '/MH-3'
            });
        })
        .catch(err => console.log(err));
}
*/

exports.getDashboard = (req, res, next) => {
    const user1 = Work.find({
            userId: req.user
        })
        .sort({
            startAt: -1
        })
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(err => console.log(err));
    const user2 = User.findById(req.user)
        .then(data => {
            data.find({attendance:})
        });
    const user3 = User.findById(req.user)
        .then(result => {
            return result;
            console.log("3");
        });
    Promise.all([user2]).then((values) => {
        console.log(values);
    });

}

exports.getCovid = (req, res, next) => {
    res.render('MH-4/main', {
        pageTitle: 'Covid',
        path: '/MH-4'
    })
}

const mongoose = require('mongoose');
const AnnualLeave = require('./annualleave');
const Schema = mongoose.Schema;

//Thêm các Functions tự viết
const exFunc = require('../util/extraFunction');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    salaryScale: {
        type: Number,
        default: 1
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: Number,
        required: true
    },
    annualLeave: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    vaccineCount: {
        type: Number,
        default: 0
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        works: [{
            type: Schema.Types.ObjectId,
            ref: 'Work',
            required: true
        }],
        annualList: [{
            type: Schema.Types.ObjectId,
            ref: 'AnnualLeave'
        }],
        timeLeaving: {
            type: Number,
        },
        workTime: {
            type: Date,
            required: true
        }
    }],
    status: {
        type: Boolean,
        default: 0
    },
});

userSchema.methods.addToAttendance = function(work) {
    const newWorkId = work._id;
    const newWorkTime = work.workTime.getTime();
    const currDate = new Date(new Date().toDateString());
    const attendance = this.attendance;
    if (attendance.length > 0) {

        let dateIndex = -2;

        for (var i = 0; this.attendance[i]; i++) {
            if (this.attendance[i].date.getTime() == currDate.getTime()) {
                dateIndex = i;
                break;
            } else {
                dateIndex = -1;
            }
        }
        if (dateIndex != -1) {
            const works = [...this.attendance[dateIndex].works];
            const lastTime = this.attendance[dateIndex].workTime.getTime();
            let workTime = lastTime;
            let annualLeave = [];
            let time = this.attendance[dateIndex].timeLeaving;

            works.push(newWorkId);
            workTime += newWorkTime;

            AnnualLeave.find({
                    userId: this._id,
                })
                .then((result) => {
                    for (var i = 0; result[i]; i++) {
                        const checkDate = exFunc.toUTC(result[i].date).getTime();
                        if (checkDate == currDate.getTime()) {
                            const leaveId = result[i]._id;
                            const leaveTime = result[i].time;
                            annualLeave.push(leaveId);
                            time += leaveTime;
                        }
                    }
                    if (time > 8) {
                        time = 8;
                    }

                })
                .then(() => {
                    const date = {
                        date: currDate,
                        works: works,
                        annualList: annualLeave,
                        timeLeaving: time,
                        workTime: workTime,
                    }

                    this.attendance[dateIndex] = date;
                    this.save();
                })
        } else {
            let date = new Date();
            let workTime = new Date(work.workTime);
            let annualLeave = [];
            let time = 0;

            AnnualLeave.find({
                    userId: this._id,
                })
                .then((result) => {
                    for (var i = 0; result[i]; i++) {
                        const checkDate = exFunc.toUTC(result[i].date).getTime();
                        if (checkDate == currDate.getTime()) {
                            const leaveId = result[i]._id;
                            const leaveTime = result[i].time;
                            annualLeave.push(leaveId);
                            time += leaveTime;
                        }
                    }
                })
                .then(result => {
                    const addWork = {
                        date: currDate,
                        works: newWorkId,
                        annualList: annualLeave,
                        timeLeaving: time,
                        workTime: workTime
                    };
                    this.attendance.push(addWork);
                    this.save();
                })
        }
    } else {
        let date = new Date();
        let workTime = new Date(work.workTime);
        let annualLeave = [];
        let time = 0;

        AnnualLeave.find({
                userId: this._id
            })
            .then((result) => {
                for (var i = 0; result[i]; i++) {
                    const checkDate = exFunc.toUTC(result[i].date).getTime();
                    if (checkDate == currDate.getTime()) {
                        const leaveId = result[i]._id;
                        const leaveTime = result[i].time;
                        annualLeave.push(leaveId);
                        time += leaveTime;
                    }
                }
            })
            .then(result => {
                const addWork = {
                    date: currDate,
                    works: newWorkId,
                    annualList: annualLeave,
                    timeLeaving: time,
                    workTime: workTime
                };
                this.attendance = addWork;
                this.save();
            })
    }
}

module.exports = mongoose.model('User', userSchema);

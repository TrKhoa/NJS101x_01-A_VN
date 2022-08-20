const mongoose = require('mongoose');
const AnnualLeave = require('./annualleave');

const Schema = mongoose.Schema;

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
        required: true
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
        annualLeave: [{
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
    function msToTime(time) {
        var ms = time % 1000;
        time = (time - ms) / 1000;
        var secs = time % 60;
        time = (time - secs) / 60;
        var mins = time % 60;
        var hrs = (time - mins) / 60;
        return hrs + ' giờ ' + mins + ' phút ' + secs + ' giây ';
    }
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
            let time = 0;

            works.push(newWorkId);
            workTime += newWorkTime;

            AnnualLeave.find({
                    userId: this._id
                })
                .then((result) => {
                    for (var i = 0; result[i]; i++) {
                        const leaveId = result[i]._id;
                        const leaveTime = result[i].time;
                        annualLeave.push(leaveId);
                        time += leaveTime;
                    }
                })
                .then(() => {
                    const date = {
                        date: currDate,
                        works: works,
                        annualLeave: annualLeave,
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
                    userId: this._id
                })
                .then((result) => {
                    for (var i = 0; result[i]; i++) {
                        const leaveId = result[i]._id;
                        const leaveTime = result[i].time;
                        annualLeave.push(leaveId);
                        time += leaveTime;
                    }
                })
                .then(result => {
                    const addWork = {
                        date: currDate,
                        works: newWorkId,
                        annualLeave: annualLeave,
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
                    const leaveId = result[i]._id;
                    const leaveTime = result[i].time;
                    annualLeave.push(leaveId);
                    time += leaveTime;
                }
            })
            .then(result => {
                const addWork = {
                    date: currDate,
                    works: newWorkId,
                    annualLeave: annualLeave,
                    timeLeaving: time,
                    workTime: workTime
                };
                this.attendance = addWork;
                this.save();
            })
    }
}

module.exports = mongoose.model('User', userSchema);

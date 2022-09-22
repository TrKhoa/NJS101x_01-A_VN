const mongoose = require('mongoose');
const AnnualLeave = require('./annualleave');
const Schema = mongoose.Schema;

//Thêm các Functions tự viết
const exFunc = require('../util/extraFunction');

//tạo Schema
const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
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
    roll : {
        type: Number,
        required: true
    },
    managerOf: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    annualLeave: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    temperature: {
        type: Number
    },
    temperatureDate: {
        type: Date
    },
    vaccine: [{
        vaccineType: {
            type: Number,
            required: true
        },
        vaccineId: {
            type: String,
            required: true
        },
        vaccineDate: {
            type: Date,
            required: true
        },
        vaccineLocation: {
            type: String,
            required: true
        }
    }],
    vaccineCount: {
        type: Number,
        default: 0
    },
    quarantineAddress:{
        type: String
    },
    wasF0:{
        type: Boolean,
        default: 0
    },
    monthF0:{
        type: Number
    },
    quickTest:{
        type: Boolean,
        default: 1
    },
    dateTest:{
        type: Date
    },
    pcr:{
        type: Boolean,
        default: 0
    },
    datePcr:{
        type: Date
    },
    //Thêm các attendance
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
    frozen: {
        month: [{
            type: Number
        }],
        year: {
            type: Number
        }
    }
});

//Tạo method thêm attendance vào user
userSchema.methods.addToAttendance = function(work) {

    //Tạo obj lưu trữ
    function Store(currDate, works, annualList, timeLeaving, workTime) {
        return {
            date: currDate,
            works: works,
            annualList: annualList,
            timeLeaving: timeLeaving,
            workTime: workTime,
        }
    }

    //Hàm lấy time và annualLeave
    function getTimeAndAnnualLeave(data, currDate, time) {

        //Khai báo biến
        const annualLeave = [];
        const checkDateList = [];
        const lastUpdateTime = [];

        //Nếu tìm dc data thì tiến hành cập nhật lại ngày nghỉ
        for (var i = 0; data[i]; i++) {
            const checkDate = exFunc.toUTC(data[i].date).getTime();
            if (checkDate == currDate.getTime()) {
                const leaveId = data[i]._id;
                const leaveTime = data[i].time;
                const idxCheckDate = checkDateList.indexOf(checkDate);
                annualLeave.push(leaveId);

                //Nếu ngày này chưa thêm số số giờ nghỉ thì kiểm tra xem số giờ nghỉ cần thêm có lớn hơn giờ nghỉ tối đa của 1 ngày và cập nhật
                if (idxCheckDate == -1 && leaveTime <= 8 && time < 8) {
                    time += leaveTime;
                    checkDateList.push(checkDate);
                    lastUpdateTime.push(leaveTime);
                }

                //Nếu đã thêm ngày thì kiểm tra giá trị lần cuối của time và cập nhật
                else {
                    if (lastUpdateTime[idxCheckDate] < 8) {
                        const newTime = Math.abs(leaveTime - lastUpdateTime[idxCheckDate])
                        time += newTime;
                        lastUpdateTime[idxCheckDate] = time;
                    }
                }
            }
        }

        //Kết quả trả về dạng obj
        const returnData = {
            annualLeave: annualLeave,
            time: time
        }
        return returnData;
    }

    //Khai báo biến
    const newWorkId = work._id;
    const newWorkTime = work.workTime.getTime();
    const currDate = new Date(new Date().toDateString());
    const attendance = this.attendance;

    //Nếu đã tồn tại trong user
    if (attendance.length > 0) {

        //Lấy index
        let dateIndex = -2;
        for (var i = 0; this.attendance[i]; i++) {
            if (this.attendance[i].date.getTime() == currDate.getTime()) {
                dateIndex = i;
                break;
            } else {
                dateIndex = -1;
            }
        }

        //Update attendance đã có trong user nếu tìm dc index
        if (dateIndex != -1) {

            //Khai báo biến
            const works = [...this.attendance[dateIndex].works];
            const lastTime = this.attendance[dateIndex].workTime.getTime();
            let workTime = lastTime;
            let annualLeave = [];
            let time = this.attendance[dateIndex].timeLeaving;

            works.push(newWorkId); //cập nhật work
            workTime += newWorkTime; //Cập nhật workTime

            //Cập nhật annualList
            AnnualLeave.find({
                    userId: this._id,
                })
                .then((result) => {
                    return getTimeAndAnnualLeave(result, currDate, time);
                })
                .then(result => {
                    const updatedValue = new Store(currDate, works, result.annualLeave, result.time, workTime);

                    //Cập nhật
                    this.attendance[dateIndex] = updatedValue;
                    this.save();
                })
        }
        //Tạo mới attendance đã có trong user khi không tìm dc index
        else {
            //Khai báo biến
            let date = new Date();
            let workTime = new Date(work.workTime);
            let annualLeave = [];
            let time = 0;

            //Thêm annualList
            AnnualLeave.find({
                    userId: this._id
                })
                .then((result) => {
                    return getTimeAndAnnualLeave(result, currDate, time);
                })
                .then(result => {
                    const Work = new Store(currDate, newWorkId, result.annualLeave, result.time, workTime);
                    //Cập nhật
                    this.attendance.push(Work);
                    this.save();
                })
        }
    }
    //Nếu chưa tồn tại trong user
    else {
        //Khai báo biến
        let date = new Date();
        let workTime = new Date(work.workTime);
        let annualLeave = [];
        let time = 0;

        //Thêm annualList
        AnnualLeave.find({
                userId: this._id
            })
            .then((result) => {
                return getTimeAndAnnualLeave(result, currDate, time);
            })
            .then(result => {
                const Work = new Store(currDate, newWorkId, result.annualLeave, result.time, workTime);

                //Thêm
                this.attendance = Work;
                this.save();
            })
    }
}

module.exports = mongoose.model('User', userSchema);

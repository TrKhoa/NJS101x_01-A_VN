const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//tạo Schema
const covidReportSchema = new Schema({
    address:{
        type: String,
        required: true
    },
    wasF0:{
        type: Boolean,
        default: 0
    },
    month:{
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
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('covidReport', covidReportSchema);

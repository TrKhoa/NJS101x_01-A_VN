const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
    date: {
        type:Date,
        required: true
    },
    time: {
        type:Number,
        required: true
    },
    reason: {
        type:String,
        required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});

module.exports = mongoose.model('annualLeave', annualLeaveSchema);

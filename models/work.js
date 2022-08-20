const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
    startAt: {
      type: Date,
      required: true
    },
    location: {
      type: Number,
      required: true
    },
    endAt: {
      type: Date,
    },
    workTime : {
        type: Date
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});

module.exports = mongoose.model('Work', workSchema);

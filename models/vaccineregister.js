const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vaccineRegisterSchema = new Schema({
    vaccineType: {
        type: Number,
        required: true
    },
    vaccineId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});

module.exports = mongoose.model('vaccineRegister', vaccineRegisterSchema);

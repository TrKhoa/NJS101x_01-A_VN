const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//tạo Schema
const temperatureRegisterSchema = new Schema({
    hasTravel: {
        type: Boolean,
        default: 0
    },
    country: {
        type: String,
    },
    hasContact: {
        type: Boolean,
        default: 0
    },
    hasSymptoms: {
        type: Boolean,
        default: 0
    },
    describe: {
        type: String
    },
    temperature: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('temperatureRegister', temperatureRegisterSchema);

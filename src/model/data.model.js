const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var dataSchema = new mongoose.Schema({
    lpg: {
        type: Number,
        required: true,

    },
    co: {
        type: Number,
        required: true,
    },
    smoke: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        require: true,
        default: "Safe"
    }
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('data', dataSchema);
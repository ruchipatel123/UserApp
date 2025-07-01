const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true,
        ref: "AppUser"
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
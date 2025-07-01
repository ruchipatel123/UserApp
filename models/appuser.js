const mongoose = require("mongoose");

const appuserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
    

});

const AppUser = mongoose.model("AppUser", appuserSchema);

module.exports = AppUser;

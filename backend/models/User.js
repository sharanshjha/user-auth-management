// User model file
// created by Sharansh Jha
// beginner level mongoose schema

const mongoose = require('mongoose');

// creating user schema
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
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // this will add createdAt and updatedAt fields automatically
});

// creating model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;

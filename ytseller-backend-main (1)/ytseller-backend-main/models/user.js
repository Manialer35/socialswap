// models/user.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // allows null without violating unique constraint
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

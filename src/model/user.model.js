const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String, 
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: 'user',
  },
  image: {
    type: String,
    default: "",
  },
  
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
module.exports = User;

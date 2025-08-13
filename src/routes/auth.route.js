const express = require("express");
const router = express.Router();
// const bcrypt = require("bcryptjs");
const User = require("../model/user.model");

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controller/auth.controller");
console.log("Auth routes file running");
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

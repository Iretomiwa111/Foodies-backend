const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verify-token.middleware");
const upload = require("../middleware/upload-middleware");
const User = require("../model/user.model");
const { updateProfile, changePassword, getMe ,forgotPassword} = require("../controller/user.controller");

router.put("/change-password", verifyToken, changePassword);
router.get("/me", verifyToken, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/update-profile", verifyToken, upload.single("image"), updateProfile);

module.exports = router;

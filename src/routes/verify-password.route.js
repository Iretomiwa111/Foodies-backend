const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../model/user.model");
const { verifyToken } = require("../middleware/verify-token.middleware");

router.post("/", verifyToken, async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({ message: "Password verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

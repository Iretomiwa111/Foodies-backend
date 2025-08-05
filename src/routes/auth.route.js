// const express = require("express");
// const router = express.Router();

// const {
//   registerUser,
//   loginUser, 
//   logoutUser,
// } = require("../controller/auth.controller");

// router.post("/register", registerUser);
// router.post("/logout", logoutUser);
// router.post("/login", loginUser);

// module.exports = router;


const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); 
const User = require("../model/user.model"); 

const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controller/auth.controller");

// Existing routes
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/login", loginUser);

// 🛠️ TEMP DEBUG ROUTE — Fix user password manually
router.post("/debug/fix-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

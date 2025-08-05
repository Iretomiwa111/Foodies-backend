// // routes/reset-password.route.js
// const express = require("express");
// const crypto = require("crypto");
// const User = require("../model/user.model");

// const router = express.Router();

// router.post("/:token", async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   console.log("Incoming token:", token);
//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//   console.log("Hashed token:", hashedToken);

//   try {
//     console.log("Incoming token:", token);
//     console.log("Hashed token:", hashedToken);
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });
//     console.log("Found user:", user); 
//     console.log("Matched user:", user);

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset error:", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

// module.exports = router;

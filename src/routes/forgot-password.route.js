// const express = require("express");
// const crypto = require("crypto");
// const User = require("../model/user.model"); 
// const sendEmail = require("../Utils/sendEmail"); 

// const router = express.Router();

// router.post("/", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found with that email" });
//     }

//     // Generate token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

//     // Set token and expiry on user
//     user.resetPasswordToken = resetTokenHash;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
//     await user.save();

//     const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

//     // Send email
//     await sendEmail({
//       to: user.email,
//       subject: "Password Reset",
//       text: `You requested a password reset. Click here to reset: ${resetUrl}`,
//     });

//     res.status(200).json({ message: "Password reset link sent to email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error sending reset link" });
//   }
// });

// module.exports = router;

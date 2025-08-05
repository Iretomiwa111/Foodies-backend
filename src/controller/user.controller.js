const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../Utils/sendEmail");

const changePassword = async (req, res) => {
  console.log("changePassword route called");
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both current and new password are required" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("User ID from token:", req.user.id);
    console.log("Input Password:", currentPassword);
    console.log("Stored Hashed Password:", user.password);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    const image = user.image ? `${baseUrl}${user.image}` : null;

    const initial = user.name ? user.name.charAt(0).toUpperCase() : "";

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        image,
      },
    });
  } catch (err) {
    console.error("Error getting user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;
    const image = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (image) updateFields.image = image;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const fullImage = updatedUser.image
      ? `${baseUrl}${updatedUser.image}`
      : null;

    res.status(200).json({
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        image: fullImage,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// const resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find user by ID from token
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or token" });
//     }

//     // Set new password
//     user.password = password;
//     await user.save();

//     res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset Password Error:", err.message);
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("REQUEST BODY:", req.body);
    const user = await User.findOne({ email });
    console.log("FOUND USER:", user)
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate ONE token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log("Saved user token:", user.resetPasswordToken);


    const resetURL = `http://localhost:5173/reset-password/${rawToken}`;

    const message = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your account at <strong>Foodies Restaurant</strong>.</p>
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
      <p>
        <a href="${resetURL}" style="
          display: inline-block;
          background-color: #ff6b6b;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        ">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <br>
      <p>— The Foodies Team</p>
    </body>
  </html>
`;

    console.log("MESSAGE HTML:\n", message);

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: message,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

module.exports = { getMe, changePassword, updateProfile, forgotPassword };

const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
// const crypto = require("crypto");

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

module.exports = { getMe, changePassword, updateProfile };

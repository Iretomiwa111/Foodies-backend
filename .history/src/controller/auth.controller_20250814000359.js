const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const crypto = require("crypto");
const sendEmail = require("../Utils/sendEmail")
const { registerSchema } = require("../schemas/auth.schemas");

exports.registerUser = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { firstname, lastname, email, password } = validatedData;

    const fullName = `${firstname.trim()} ${lastname.trim()}`;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // const hashedPassword = password;

    const newUser = new User({
      name: fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    if (err.name === "ZodError") {
      console.log("Zod Validation Error:", err.errors);
      const formatted = err.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res
        .status(400)
        .json({ message: "Validation error", errors: formatted });
    }

    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  try {
    console.log("Login attempt email:", email);
    console.log("Login attempt password:", password);

    const user = await User.findOne({ email });

    console.log("Found user:", user);

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    console.log("Entered password:", password);
    console.log("Hashed password:", user.password);
    console.log(
      "Entered password (raw):",
      password.split("").map((c) => c.charCodeAt(0))
    );
    console.log(
      "Stored hash:",
      `"${user.password}"`,
      "Length:",
      user.password.length
    );

    if (typeof password !== "string") {
      return res.status(400).json({ message: "Password must be a string" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const image = user.image ? `${baseUrl}${user.image}` : null;

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
       sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    ;
exports.logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

  });

  res.status(200).json({ message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to user
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h2 style="color: #d35400;">Foodies Restaurant</h2>
          <p>You requested a password reset.</p>
          <p>
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #d35400; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Click here to reset your password
            </a>
          </p>
          <p>This link will expire in <strong>15 minutes</strong>.</p>
        </div>
      `
    });

    res.json({ message: "Email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
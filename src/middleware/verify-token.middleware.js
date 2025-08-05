const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

exports.verifyToken = async (req, res, next) => {
  console.log("Cookies:", req.cookies);

  const token = req.cookies.token;
  if (!token) {
    console.log(" No token found in cookies");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
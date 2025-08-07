require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const path = require("path");

// const allowedOrigins = process.env.FRONTEND_URL.split(",");

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };


app.use(cors({
   origin:[
    "https://localhost:5000",
    "http://localhost:5173",
    "https://foodies-restaurant-delta.vercel.app"
   ],
     credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const authRoute = require("./src/routes/auth.route");
const userRoute = require("./src/routes/user.route");
const reservationRoutes = require("./src/routes/reservation.route");
const orderRoutes = require("./src/routes/order.route");
const menuRoutes = require("./src/routes/menu.route");
const cartRoutes = require("./src/routes/cart.route");
const verifyPasswordRoute = require("./src/routes/verify-password.route");
// const forgotPasswordRoute = require("./src/routes/forgot-password.route");
// const resetPasswordRoute = require("./src/routes/reset-password.route");

app.get("/", (req, res) => {
  res.send("HEllo Client");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/verify-password", verifyPasswordRoute);
// app.use("/api/v1/forgot-password", forgotPasswordRoute);
// app.use("/api/v1/reset-password", resetPasswordRoute);

app.use((req, res) => {
  res.status(404).send("404 page");
});

// const port = 5000;
async function connectDB() {
  try {
    const con = await mongoose.connect(process.env.MONGO_URL);
    console.log("database connected successfully");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Example app listening on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error);
  }
}

connectDB();

const express = require("express");
const router = express.Router();
const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  deleteMenuItem,
  updateMenuItem,
} = require("../controller/menu.controller");
const { verifyToken, verifyAdmin } = require("../middleware/verify-token.middleware");
const upload = require("../middleware/upload-middleware"); // if using image uploads

// Public routes
router.get("/", getAllMenuItems);
router.get("/:id", getMenuItemById);

// Admin routes
router.post("/", verifyToken, verifyAdmin, upload.single("image"), createMenuItem);
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateMenuItem);
router.delete("/:id", verifyToken, verifyAdmin, deleteMenuItem);


module.exports = router;

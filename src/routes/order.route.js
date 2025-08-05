const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/check-role.middleware");

const {
  createOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} = require("../controller/order.controller");

const {verifyToken} = require("../middleware/verify-token.middleware");

router.post("/", verifyToken, createOrder);
router.get("/me", verifyToken, getMyOrders);
router.delete("/:id", verifyToken, cancelOrder);
router.get("/", verifyToken, isAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, isAdmin, updateOrderStatus);
router.delete("/:id/admin", verifyToken, isAdmin, deleteOrder);

module.exports = router;

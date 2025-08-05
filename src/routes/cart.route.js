const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verify-token.middleware");

const {
  addToCart,
  getUserCart,
  removeCartItem,
  updateCartItemQuantity,
} = require("../controller/cart.controller");

router.post("/", verifyToken, addToCart);
router.get("/", verifyToken, getUserCart);
router.patch("/:id", verifyToken, updateCartItemQuantity);
router.delete("/:id", verifyToken, removeCartItem);

module.exports = router;


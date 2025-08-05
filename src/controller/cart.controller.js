const CartItem = require("../model/cart.model");
const Menu = require("../model/menu.model");

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId, quantity } = req.body;

    console.log("Incoming menuItemId:", menuItemId);
    const menuItem = await Menu.findById(menuItemId);
    console.log("Found menu item:", menuItem)
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let cartItem = await CartItem.findOne({ user: userId, menuItem: menuItemId });

    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      cartItem = new CartItem({
        user: userId,
        menuItem: menuItemId,
        quantity: quantity || 1,
      });
    }

    await cartItem.save();
    res.status(200).json(cartItem);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await CartItem.find({ user: userId }).populate("menuItem");
    res.status(200).json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    await CartItem.findByIdAndDelete(cartItemId);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};
const updateCartItemQuantity = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (err) {
    console.error("Update cart quantity error:", err);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};


module.exports = {
  addToCart,
  getUserCart,
  removeCartItem,
  updateCartItemQuantity,
};

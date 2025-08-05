const Order = require("../model/order.model");
const CartItem = require("../model/cart.model");
const Menu = require("../model/menu.model");
const sendSMS = require("../Utils/sendOrderSms");
const sendEmail = require("../Utils/sendEmail");

function formatPhoneNumber(number) {  
  if (number.startsWith("0")) {
    return "+234" + number.slice(1);
  }
  return number;
}

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod, notes, deliveryInfo } = req.body;

    if (
      !deliveryInfo ||
      !deliveryInfo.name ||
      !deliveryInfo.address ||
      !deliveryInfo.phone ||
      !deliveryInfo.email
    ) {
      return res
        .status(400)
        .json({ message: "Incomplete delivery information" });
    }

    const cartItems = await CartItem.find({ user: userId }).populate("menuItem");

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const items = cartItems.map((cart) => ({
      name: cart.menuItem.name,
      quantity: cart.quantity,
      price: cart.menuItem.price,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      user: userId,
      items,
      totalAmount: total,
      paymentMethod,
      notes,
      deliveryInfo,
      status: "pending",
      createdAt: new Date(),
    });

    await order.save();

    // 1. Send SMS to user
    const smsMessage = `Hi ${deliveryInfo.name}, your order of ₦${total} has been received and is being processed. Thank you for choosing Foodies!`;
    sendSMS(deliveryInfo.phone, smsMessage);

    // 2. Send Email to customer
    const emailHtml = `
      <h2>Hi ${deliveryInfo.name},</h2>
      <p>Thank you for your order! Here’s a summary:</p>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>${item.quantity} × ${item.name} — ₦${item.price}</li>`
          )
          .join("")}
      </ul>
      <p><strong>Total:</strong> ₦${total}</p>
      <p>We’ll notify you once it’s on the way. 😊</p>
    `;
   await sendEmail({
  to: deliveryInfo.email,
  subject: "Your Foodies Order Confirmation",
  html: emailHtml,
});

    // 3. Send Email to Admin
    const adminEmailHtml = `
      <h2>New Order Received</h2>
      <p><strong>Customer:</strong> ${deliveryInfo.name}</p>
      <p><strong>Email:</strong> ${deliveryInfo.email}</p>
      <p><strong>Phone:</strong> ${deliveryInfo.phone}</p>
      <p><strong>Address:</strong> ${deliveryInfo.address}</p>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>${item.quantity} × ${item.name} — ₦${item.price}</li>`
          )
          .join("")}
      </ul>
      <p><strong>Total:</strong> ₦${total}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Notes:</strong> ${notes || "None"}</p>
    `;
   await sendEmail({
  to: process.env.ADMIN_EMAIL,
  subject: "New Order Received",
  html: adminEmailHtml,
});


    // 4. Clear cart
    await CartItem.deleteMany({ user: userId });

    const savedOrder = {
      ...order.toObject(),
      items,
    };

    res.status(201).json({ message: "Order placed", order: savedOrder });

  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    console.log("Fetched Orders with Populated Items:", orders);

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const query = {};

    // If status query param is provided (e.g. ?status=pending)
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("Admin fetch orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controller/order.controller.js
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Only update status field
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true, context: "query" } // just in case for enums
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// DELETE /api/v1/orders/:id/admin
exports.deleteOrder = async (req, res) => {
  try {
    console.log("ORDER ID:", req.params.id);
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

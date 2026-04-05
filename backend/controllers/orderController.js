const Order = require("../models/Order");
const Cart = require("../models/Cart");

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "A valid amount is required",
      });
    }

    // Fetch cart and validate
    const cart = await Cart.findOne({ user: req.user }).populate("items.product");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty. Cannot create order.",
      });
    }

    // Calculate actual total from cart (server-side validation)
    const actualTotal = cart.items.reduce((sum, item) => {
      const price = Number(item?.product?.price || 0);
      const quantity = Number(item?.quantity || 1);

      return sum + price * quantity;
    }, 0);

    // Verify client amount matches server calculation (prevent tampering)
    if (Math.abs(actualTotal - Number(amount)) > 0.01) {
      return res.status(400).json({
        message: "Amount mismatch. Please refresh and try again.",
      });
    }

    // Create order with cart items
    const order = await Order.create({
      user: req.user,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount: actualTotal,
      paymentStatus: "paid",
    });

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder };
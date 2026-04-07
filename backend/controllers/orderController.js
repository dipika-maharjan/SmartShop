const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Stripe = require("stripe");
const { getValidCouponByCode, calculateDiscount } = require("../utils/couponUtils");

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const createOrder = async (req, res) => {
  try {
    const { amount, paymentIntentId, couponCode } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "A valid amount is required",
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({
        message: "paymentIntentId is required",
      });
    }

    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      return res.status(409).json({
        message: "Order already exists for this payment",
      });
    }

    const stripe = getStripe();

    if (!stripe) {
      return res.status(500).json({
        message: "Stripe secret key is not configured",
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
    const subtotalAmount = cart.items.reduce((sum, item) => {
      const price = Number(item?.product?.price || 0);
      const quantity = Number(item?.quantity || 1);

      return sum + price * quantity;
    }, 0);

    let coupon = null;
    if (couponCode) {
      try {
        coupon = await getValidCouponByCode({ code: couponCode, amount: subtotalAmount });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const { discountAmount, finalAmount } = calculateDiscount({ amount: subtotalAmount, coupon });

    // Verify client amount matches server calculation (prevent tampering)
    if (Math.abs(finalAmount - Number(amount)) > 0.01) {
      return res.status(400).json({
        message: "Amount mismatch. Please refresh and try again.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment is not completed",
      });
    }

    if (paymentIntent.metadata?.userId !== String(req.user)) {
      return res.status(403).json({
        message: "Payment does not belong to this user",
      });
    }

    const paidAmount = Number(paymentIntent.amount_received || paymentIntent.amount || 0);
    const expectedAmount = Math.round(finalAmount * 100);

    if (Math.abs(paidAmount - expectedAmount) > 1) {
      return res.status(400).json({
        message: "Paid amount mismatch",
      });
    }

    // Validate inventory before order placement
    for (const item of cart.items) {
      const currentProduct = await Product.findById(item.product._id);

      if (!currentProduct) {
        return res.status(400).json({
          message: "One or more products are no longer available.",
        });
      }

      if (Number(currentProduct.stock || 0) < Number(item.quantity || 1)) {
        return res.status(400).json({
          message: `Insufficient stock for ${currentProduct.title}`,
        });
      }
    }

    // Create order with cart items
    const order = await Order.create({
      user: req.user,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      subtotalAmount,
      discountAmount,
      couponCode: coupon?.code,
      totalAmount: finalAmount,
      paymentIntentId,
      paymentStatus: "paid",
    });

    // Decrease product stock after order is created
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -Number(item.quantity || 1) },
      });
    }

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

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders };
const Stripe = require("stripe");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { getValidCouponByCode, calculateDiscount } = require("../utils/couponUtils");

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { couponCode } = req.body || {};
    const stripe = getStripe();

    if (!stripe) {
      return res.status(500).json({
        message: "Stripe secret key is not configured",
      });
    }

    const cart = await Cart.findOne({ user: req.user }).populate("items.product");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const subtotal = cart.items.reduce((acc, item) => {
      return acc + Number(item?.product?.price || 0) * Number(item?.quantity || 1);
    }, 0);

    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({
        message: "Invalid cart total amount",
      });
    }

    let coupon = null;
    if (couponCode) {
      try {
        coupon = await getValidCouponByCode({ code: couponCode, amount: subtotal });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const { discountAmount, finalAmount } = calculateDiscount({ amount: subtotal, coupon });

    const amountInCents = Math.round(finalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId: String(req.user),
        couponCode: coupon?.code || "",
        discountAmount: String(discountAmount || 0),
        subtotalAmount: String(subtotal),
      },
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).json({
        message: "Stripe did not return a client secret",
      });
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotalAmount: subtotal,
      discountAmount,
      amount: finalAmount,
      couponCode: coupon?.code || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleStripeWebhook = async (req, res) => {
  try {
    const stripe = getStripe();

    if (!stripe) {
      return res.status(500).json({ message: "Stripe secret key is not configured" });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ message: "Stripe webhook secret is not configured" });
    }

    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).send("Missing stripe-signature header");
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: "paid" },
        { new: true }
      );
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: "failed" },
        { new: true }
      );
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = { createPaymentIntent, handleStripeWebhook };
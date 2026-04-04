const Cart = require("../models/Cart");
const mongoose = require("mongoose");

const getProductId = (req) => req.body?.productId || req.query?.productId;

// Add to cart
const addToCart = async (req, res) => {
  const productId = getProductId(req);

  try {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "A valid productId is required",
      });
    }

    let cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      cart = await Cart.create({
        user: req.user,
        items: [{ product: productId }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product: productId });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user }).populate("items.product");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove item
const removeFromCart = async (req, res) => {
  const productId = getProductId(req);

  try {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "A valid productId is required",
      });
    }

    const cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart };
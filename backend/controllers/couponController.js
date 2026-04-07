const Coupon = require("../models/Coupon");
const { getValidCouponByCode, calculateDiscount } = require("../utils/couponUtils");

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiresAt, isActive } = req.body;

    if (!code || !discountType || typeof discountValue === "undefined") {
      return res.status(400).json({ message: "code, discountType, and discountValue are required" });
    }

    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "code and valid amount are required" });
    }

    const coupon = await getValidCouponByCode({ code, amount: Number(amount) });
    const { discountAmount, finalAmount } = calculateDiscount({ amount: Number(amount), coupon });

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  applyCoupon,
};

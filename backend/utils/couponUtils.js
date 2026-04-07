const Coupon = require("../models/Coupon");

const getValidCouponByCode = async ({ code, amount }) => {
  if (!code) {
    return null;
  }

  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });

  if (!coupon || !coupon.isActive) {
    throw new Error("Coupon is invalid or inactive");
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new Error("Coupon has expired");
  }

  if (Number(amount || 0) < Number(coupon.minOrderAmount || 0)) {
    throw new Error(`Minimum order amount is Rs ${coupon.minOrderAmount}`);
  }

  return coupon;
};

const calculateDiscount = ({ amount, coupon }) => {
  if (!coupon) {
    return { discountAmount: 0, finalAmount: Number(amount || 0) };
  }

  const numericAmount = Number(amount || 0);
  let discountAmount = 0;

  if (coupon.discountType === "percent") {
    discountAmount = (numericAmount * Number(coupon.discountValue || 0)) / 100;
  }

  if (coupon.discountType === "fixed") {
    discountAmount = Number(coupon.discountValue || 0);
  }

  discountAmount = Math.max(0, Math.min(discountAmount, numericAmount));
  const finalAmount = Math.max(0, numericAmount - discountAmount);

  return {
    discountAmount,
    finalAmount,
  };
};

module.exports = {
  getValidCouponByCode,
  calculateDiscount,
};

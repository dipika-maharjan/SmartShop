const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createCoupon,
  getCoupons,
  applyCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getCoupons);
router.post("/apply", protect, applyCoupon);

module.exports = router;

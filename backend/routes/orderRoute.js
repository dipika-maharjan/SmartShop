const express = require("express");
const {
	createOrder,
	getMyOrders,
	getAllOrders,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAllOrders);
router.get("/my", protect, getMyOrders);
router.post("/", protect, createOrder);

module.exports = router;
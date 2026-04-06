const express = require("express");
const {
	createOrder,
	getMyOrders,
	getAllOrders,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllOrders);
router.get("/my", protect, getMyOrders);
router.post("/", protect, createOrder);

module.exports = router;
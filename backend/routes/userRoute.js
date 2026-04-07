const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, removeAddress);

module.exports = router;

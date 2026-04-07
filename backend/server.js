const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });
const { handleStripeWebhook } = require("./controllers/paymentController");
connectDB();

const app = express();

// Middleware
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("API running...");
});

const authRoutes = require("./routes/authRoute");
const protect = require("./middleware/authMiddleware");
const productRoutes = require("./routes/productRoute");
const cartRoutes = require("./routes/cartRoute");
const paymentRoutes = require("./routes/paymentRoute");
const orderRoutes = require("./routes/orderRoute");
const userRoutes = require("./routes/userRoute");
const wishlistRoutes = require("./routes/wishlistRoute");
const couponRoutes = require("./routes/couponRoute");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
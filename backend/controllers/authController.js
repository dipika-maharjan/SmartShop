const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10,15}$/;

const isEmpty = (value) => !value || !String(value).trim();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role || "user" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role || "user",
});

// Register
const registerUser = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");

  try {
    if (
      [name, email, phone, password, confirmPassword].some((value) =>
        isEmpty(value)
      )
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (String(name).trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    if (!phonePattern.test(normalizedPhone)) {
      return res.status(400).json({
        message: "Enter a valid phone number",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered",
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    if (isEmpty(email) || isEmpty(password)) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role || "user" }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { registerUser, loginUser };
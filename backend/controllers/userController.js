const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (typeof name !== "undefined") {
      updates.name = String(name).trim();
    }

    if (typeof phone !== "undefined") {
      updates.phone = String(phone).trim();
    }

    const user = await User.findByIdAndUpdate(req.user, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const { label, line1, city, state, postalCode, country } = req.body;

    if (!line1 || !city) {
      return res.status(400).json({ message: "line1 and city are required" });
    }

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push({
      label: label ? String(label).trim() : "Home",
      line1: String(line1).trim(),
      city: String(city).trim(),
      state: state ? String(state).trim() : "",
      postalCode: postalCode ? String(postalCode).trim() : "",
      country: country ? String(country).trim() : "Nepal",
    });

    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
};

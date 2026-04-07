const Product = require("../models/Product");

// Create Product (admin for now, no role check)
const createProduct = async (req, res) => {
  try {
    const { title, price, image, description, category, stock } = req.body;

    if (!title || Number(price) <= 0) {
      return res.status(400).json({
        message: "Title and valid price are required",
      });
    }

    const product = await Product.create({
      title: String(title).trim(),
      price: Number(price),
      image: image ? String(image).trim() : "",
      description: description ? String(description).trim() : "",
      category: category ? String(category).trim() : "General",
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      nameAsc: { title: 1 },
    };

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const skip = (parsedPage - 1) * parsedLimit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(parsedLimit),
      Product.countDocuments(filter),
    ]);

    res.json({
      items: products,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { title, price, image, description, category, stock } = req.body;

    const updates = {};

    if (typeof title !== "undefined") {
      updates.title = String(title).trim();
    }
    if (typeof price !== "undefined") {
      updates.price = Number(price);
    }
    if (typeof image !== "undefined") {
      updates.image = String(image).trim();
    }
    if (typeof description !== "undefined") {
      updates.description = String(description).trim();
    }
    if (typeof category !== "undefined") {
      updates.category = String(category).trim();
    }
    if (typeof stock !== "undefined") {
      updates.stock = Number(stock);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
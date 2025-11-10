// controllers/clicksController.js
import Click from "../models/Click.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// === Record or update user's product view history ===
export const recordUserViewHistory = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId)
      return res.status(400).json({ message: "userId and productId are required" });

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) return res.status(404).json({ message: "User or Product not found" });

    const existing = await Click.findOne({ userId, productId, type: "history" });

    if (existing) {
      existing.lastViewed = new Date();
      await existing.save();
    } else {
      await Click.create({
        userId,
        productId,
        category: product.category || "Unknown",
        type: "history",
        lastViewed: new Date(),
      });
    }

    res.status(200).json({ message: "User view history updated successfully" });
  } catch (err) {
    console.error("recordUserViewHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// === Get a specific user's view history ===
export const getUserViewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Click.find({ userId, type: "history" })
      .populate("productId", "name category price image")
      .sort({ lastViewed: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error("getUserViewHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// === Clear user history ===
export const clearUserViewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    await Click.deleteMany({ userId, type: "history" });
    res.status(200).json({ message: "User view history cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// === Record product click count ===
export const recordProductClick = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Click.create({ productId, type: "product", category: product.category });
    res.status(200).json({ message: "Product click recorded" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// === Get total clicks by product ===
export const getProductClicksByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const count = await Click.countDocuments({ productId, type: "product" });
    res.status(200).json({ productId, totalClicks: count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// === Get all click logs for admin ===
export const getAllClicks = async (req, res) => {
  try {
    const all = await Click.find()
      .populate("userId", "firstName lastName email")
      .populate("productId", "name category");
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

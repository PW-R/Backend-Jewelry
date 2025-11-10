import express from "express";
import {
  recordUserViewHistory,
  getUserViewHistory,
  clearUserViewHistory,
  recordProductClick,
  getProductClicksByProductId,
  getAllClicks,
} from "../controllers/clicksController.js";

const router = express.Router();

/**
 * ===============================
 * 📌 CLICK & VIEW HISTORY ROUTES
 * ===============================
 */

// === USER VIEW HISTORY ===

// Record or update a user's product view
router.post("/history", recordUserViewHistory);

// Get a specific user's view history
router.get("/history/:userId", getUserViewHistory);

// Clear a specific user's view history
router.delete("/history/:userId", clearUserViewHistory);

// === PRODUCT CLICK ANALYTICS ===

// Record or increment total product click count
router.post("/product", recordProductClick);

// Get total click count for a specific product
router.get("/product/:productId", getProductClicksByProductId);

// === ADMIN ANALYTICS ===

// Get all click records (all users, all products)
router.get("/", getAllClicks);

export default router;

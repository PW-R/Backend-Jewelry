import Product from "../models/Product.js";
import cloudinaryConfig from "../config/cloudinary.js";
const { cloudinary } = cloudinaryConfig;

//สร้างรหัสสินค้าอัตโนมัติตามหมวดหมู่
export const getNextCode = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const normalizedCategory = category.trim().toLowerCase();

    let prefix = "PRD";

    if (normalizedCategory.startsWith("necklace")) prefix = "NCK";
    else if (normalizedCategory.startsWith("ring")) prefix = "RNG";
    else if (normalizedCategory.startsWith("bracelet")) prefix = "BRC";
    else if (normalizedCategory.startsWith("earring")) prefix = "ERN";
    

    // ✅ หา product ล่าสุดใน category นั้น
    const lastProduct = await Product.findOne({ category })
      .sort({ createdAt: -1 })
      .exec();

    let nextNumber = 1;
    if (lastProduct && lastProduct.code) {
      const match = lastProduct.code.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }

    const nextCode = `${prefix}${String(nextNumber).padStart(3, "0")}`;
    res.json({ nextCode });
  } catch (err) {
    console.error("Error generating next code:", err);
    res.status(500).json({ message: err.message });
  }
};

// === GET ALL PRODUCTS (optional filter by category) ===
export const getProducts = async (req, res) => {
  const { category } = req.query;

  try {
    const query = category ? { category } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error("❌ Error in getProducts:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// === GET PRODUCTS BY CATEGORY PARAM ===
export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    console.error("❌ Error in getProductsByCategory:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// === GET SINGLE PRODUCT BY ID ===
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === CREATE NEW PRODUCT ===
export const createProduct = async (req, res) => {
  try {
    console.log("[CREATE PRODUCT] Starting...");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    const {
      code,
      name,
      description,
      category,
      price,
      material,
      weight,
      stock,
    } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const newProduct = new Product({
      code,
      name,
      description,
      category,
      price,
      material,
      weight,
      stock,
      images,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === UPDATE PRODUCT ===
export const updateProduct = async (req, res) => {
  try {
    
    const { id } = req.params;
    
    const updates = req.body;

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file) => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    console.log("\n✅ PRODUCT UPDATED SUCCESSFULLY");
    console.log("📌 Updated Product:", updatedProduct);
    console.log("=======================\n");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === DELETE PRODUCT ===
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === DELETE SINGLE IMAGE ยังไม่ได้เอามาใช้
export const deleteSingleImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // ดึง public_id จาก URL เช่น jewelry_products/abc123
    const publicId = url.split("/").slice(-2).join("/").split(".")[0];

    // ลบจาก Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // ลบ URL นี้ออกจาก DB ด้วย (ถ้ามีสินค้าอ้างถึง)
    await Product.updateMany({ images: url }, { $pull: { images: url } });

    res.json({ message: "✅ Image deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

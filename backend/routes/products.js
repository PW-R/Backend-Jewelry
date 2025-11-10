import express from 'express';
import multer from 'multer';
import { 
  getNextCode,
  getProducts, 
  getProductsByCategory,
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  deleteSingleImage
} from '../controllers/productsController.js';
import authenticate from '../middleware/auth.js';
import cloudinaryConfig from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: cloudinaryConfig.storage });
// === GET NEXT PRODUCT CODE ===
router.get('/next-code', getNextCode);
// === GET ALL PRODUCTS ===
router.get('/', getProducts);
// === GET PRODUCTS BY CATEGORY ===
router.get("/category/:category", getProductsByCategory);
// === GET SINGLE PRODUCT ===
router.get('/:id', getProductById);

// === CREATE NEW PRODUCT === (authenticated + images)
router.post('/', authenticate, upload.array('images', 5), createProduct);

// === UPDATE PRODUCT === (authenticated + optional images)
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);

// === DELETE PRODUCT === (authenticated)
router.delete('/:id', authenticate, deleteProduct);
// === DELETE SINGLE IMAGE FROM PRODUCT === (authenticated)
router.delete("/image", authenticate, deleteSingleImage);

export default router;

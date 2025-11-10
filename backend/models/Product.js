import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // รหัสสินค้า
  name: { type: String, required: true },               // ชื่อสินค้า
  images: [{ type: String }],                           // รูปสินค้า (Cloudinary URLs)
  description: { type: String },                        // คำอธิบายสินค้า
  category: { type: String },                            // ข้อมูลประเภทสินค้า
  price: { type: Number, required: true },             // ราคา
  material: { type: String },                           // วัตถุดิบที่ทำจาก
  weight: { type: Number },                             // น้ำหนัก
  stock: { type: Number, default: 0 }                  // จำนวนสินค้าคงคลัง
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

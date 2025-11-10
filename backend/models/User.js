// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  title: { 
    type: String, 
    enum: ['Mr.', 'Mrs.', 'Ms.', 'Other'], 
    required: true 
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, min: 0, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
}, { timestamps: true });

// เข้ารหัสรหัสผ่านก่อนบันทึก
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ฟังก์ชันตรวจสอบรหัสผ่าน
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

// ประกาศตัวแปรโมเดลและ export default
const User = mongoose.model('User', userSchema);
export default User;

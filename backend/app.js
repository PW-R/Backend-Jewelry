import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";

// === ROUTES ===
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import clickRoutes from "./routes/clicks.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/clicks", clickRoutes);
app.use("/api/chats", chatRoutes);

export default app;

// Optional: you can export a function to init DB if needed in tests
export const initDB = async () => {
  await connectDB();
  const adminEmail = "admin@example.com";
  const admin = await User.findOne({ email: adminEmail });
  const hashed = await bcrypt.hash("Admin1234", 10);

  if (admin) {
    await User.updateOne({ _id: admin._id }, { $set: { password: hashed } });
  } else {
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashed,
      role: "speradmin",
    });
  }
};

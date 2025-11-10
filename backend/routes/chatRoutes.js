import express from "express";
import {
  sendCustomerMessage,
  adminReply,
  getChatsByAdmin,
  getChatByCustomer,
  getAllChats,
  closeChat,
  acceptChat,
} from "../controllers/chatController.js";

const router = express.Router();

// ลูกค้าส่งข้อความ
router.post("/send", sendCustomerMessage);

// แอดมินตอบข้อความ
router.post("/reply", adminReply);

// แอดมินดูเฉพาะของตัวเอง
router.get("/admin/:adminId", getChatsByAdmin);

// ลูกค้าดูแชทของตนเอง
router.get("/customer/:customerId", getChatByCustomer);

// แอดมินดูทุกห้อง (optional)
router.get("/", getAllChats);
// แอดมินรับแชท (assign)
router.put("/accept/:chatId", acceptChat);  

// ปิดการสนทนา (optional)
router.put("/close/:chatId", closeChat);

export default router;

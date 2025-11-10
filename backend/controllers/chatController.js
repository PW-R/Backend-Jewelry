// controllers/chatController.js
import Chat from "../models/Chat.js";

// === สร้างหรืออัปเดตแชทของลูกค้า ===
export const sendCustomerMessage = async (req, res) => {
  try {
    const { customerId, message } = req.body;

    if (!customerId || !message)
      return res.status(400).json({ message: "Missing required fields" });

    // หาแชทของลูกค้าคนนี้ ถ้ายังไม่มีให้สร้างใหม่
    let chat = await Chat.findOne({ customerId });
    if (!chat) chat = new Chat({ customerId, messages: [] });

    chat.messages.push({ sender: "customer", text: message });
    await chat.save();

    res.status(200).json({ message: "Message sent successfully", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === แอดมินตอบกลับลูกค้า ===
export const adminReply = async (req, res) => {
  try {
    const { chatId, adminId, message } = req.body;

    if (!chatId || !adminId || !message)
      return res.status(400).json({ message: "Missing required fields" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ถ้ายังไม่มีแอดมินประจำห้อง ผูกคนนี้เป็นคนแรก
    if (!chat.isAssigned) {
      chat.adminId = adminId;
      chat.isAssigned = true;
    }

    chat.messages.push({ sender: "admin", text: message });
    await chat.save();

    res.status(200).json({ message: "Reply sent successfully", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === ดึงแชททั้งหมดของแอดมินคนนั้น ===
export const getChatsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const chats = await Chat.find({ adminId })
      .populate("customerId", "firstName lastName email")
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === ดึงแชทของลูกค้าคนเดียว ===
export const getChatByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const chat = await Chat.findOne({ customerId })
      .populate("adminId", "firstName lastName email");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === ดึงแชททั้งหมด (เฉพาะ admin เท่านั้น) ===
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("customerId", "firstName lastName")
      .populate("adminId", "firstName lastName");
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// === ปิดการสนทนา (mark resolved) ===
export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isResolved = true;
    await chat.save();

    res.status(200).json({ message: "Chat closed successfully", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// pending changes to other files
export const acceptChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { adminId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ถ้ามีแอดมินประจำอยู่แล้ว ให้บล็อคไว้
    if (chat.isAssigned && chat.adminId) {
      return res
        .status(400)
        .json({ message: "This chat is already assigned to another admin." });
    }

    chat.adminId = adminId;
    chat.isAssigned = true;
    await chat.save();

    res.json({ message: "Chat accepted successfully", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
import Chat from "../models/Chat.js";

export default function registerChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`🟢 Joined room: ${roomId}`);
    });

    socket.on("send_message", async (data) => {
      const { roomId, customerId, message } = data;
      if (!message?.trim()) return;

      let chat = await Chat.findOne({ customerId });
      if (!chat) chat = new Chat({ customerId, messages: [] });

      const newMsg = { sender: "customer", text: message, timestamp: new Date() };
      const lastMsg = chat.messages.at(-1);

      if (!lastMsg || lastMsg.text !== newMsg.text || lastMsg.sender !== newMsg.sender) {
        chat.messages.push(newMsg);
        await chat.save();
      }

      io.to(roomId).emit("receive_message", newMsg);
      io.emit("new_customer_chat", chat);
    });

    socket.on("admin_reply", async (data) => {
      const { roomId, chatId, adminId, message } = data;
      if (!message?.trim()) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      if (!chat.isAssigned) {
        chat.adminId = adminId;
        chat.isAssigned = true;
      }

      const newMsg = { sender: "admin", text: message, timestamp: new Date() };
      const lastMsg = chat.messages.at(-1);

      if (!lastMsg || lastMsg.text !== newMsg.text || lastMsg.sender !== newMsg.sender) {
        chat.messages.push(newMsg);
        await chat.save();
      }

      io.to(roomId).emit("receive_message", newMsg);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

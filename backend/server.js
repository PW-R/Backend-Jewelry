// backend/server.js
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app, { initDB } from "./app.js";
import registerChatSocket from "./socket/chatSocket.js";

dotenv.config();

dotenv.config();

const startServer = async () => {
  try {
    await initDB();
    console.log("✅ MongoDB connected and admin ready");

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: "*" },
    });

    // 👉 เรียกใช้ socket logic แยกออกไป
    registerChatSocket(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
};

startServer();
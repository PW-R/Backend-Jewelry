// backend/server.js
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app, { initDB } from "./app.js";
import registerChatSocket from "./socket/chatSocket.js";

// Load .env only in local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const startServer = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set. Check your environment variables.");
    }

    await initDB();
    console.log("✅ MongoDB connected and admin ready");

    // Create HTTP server
    const server = http.createServer(app);

    // Setup Socket.IO with CORS
    const io = new Server(server, {
      cors: {
        origin: "*", // Change to frontend URL in production
        methods: ["GET", "POST"],
      },
    });

    // Register socket events
    registerChatSocket(io);

    // Use Render's dynamic port or fallback to 10000 for local dev
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
};

// Start the server
startServer();

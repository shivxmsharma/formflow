require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { connectDB } = require("./config/db");
const { initSocket } = require("./socket/socket.server");

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();

    // Create HTTP server from Express app — Socket.io attaches to this
    const httpServer = http.createServer(app);

    // Attach Socket.io with CORS matching the Express config
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    // Boot all socket event handlers
    initSocket(io);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`⚡ Socket.io ready`);
        console.log(`   Environment: ${process.env.NODE_ENV}`);
    });
};

start();
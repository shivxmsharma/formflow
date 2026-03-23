import { io } from "socket.io-client";
import { getAccessToken } from "../api/axios";

// In development: connect to localhost:5000 explicitly
// In production: connect to same origin (window.location.origin)
// This works because both frontend and backend are served from the same Render URL
const SERVER_URL = import.meta.env.DEV
    ? "http://localhost:5000"
    : window.location.origin;

const socket = io(SERVER_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => {
        cb({ token: getAccessToken() });
    },
});

if (import.meta.env.DEV) {
    socket.on("connect", () =>
        console.log("⚡ Socket connected:", socket.id)
    );
    socket.on("disconnect", (reason) =>
        console.log("🔌 Socket disconnected:", reason)
    );
    socket.on("connect_error", (err) =>
        console.error("❌ Socket error:", err.message)
    );
}

export default socket;
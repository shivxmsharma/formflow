const { verifyAccessToken } = require("../config/jwt");
const { User } = require("../models");

// In-memory presence map
// { formId: { socketId: { userId, name, email, color } } }
const presence = {};

// Assign a consistent avatar color per user based on their ID
const COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];
const getColor = (userId) => {
    const idx = userId.charCodeAt(0) % COLORS.length;
    return COLORS[idx];
};

const initSocket = (io) => {

    // ── Auth middleware on every connection handshake ──────────────────────────
    // Client must pass { auth: { token: accessToken } } when connecting
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("AUTH_REQUIRED"));

            const decoded = verifyAccessToken(token);
            const user = await User.findByPk(decoded.id, {
                attributes: ["id", "name", "email"],
            });
            if (!user) return next(new Error("USER_NOT_FOUND"));

            socket.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                color: getColor(user.id),
            };
            next();
        } catch (err) {
            next(new Error("INVALID_TOKEN"));
        }
    });

    // ── Connection ─────────────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id} (${socket.user.email})`);

        // ── join_form ────────────────────────────────────────────────────────────
        // Client emits this as soon as BuilderPage mounts
        // Payload: { formId }
        socket.on("join_form", ({ formId }) => {
            if (!formId) return;

            socket.join(formId);
            socket.currentFormId = formId;

            // Register presence
            if (!presence[formId]) presence[formId] = {};
            presence[formId][socket.id] = socket.user;

            // Tell everyone in the room (including sender) the updated presence list
            io.to(formId).emit("presence_update", {
                users: Object.values(presence[formId]),
            });

            console.log(`👥 ${socket.user.name} joined form ${formId}`);
        });

        // ── leave_form ───────────────────────────────────────────────────────────
        socket.on("leave_form", ({ formId }) => {
            handleLeave(socket, formId, io);
        });

        // ── field_added ──────────────────────────────────────────────────────────
        // Payload: { formId, field }
        // Sender has already saved to DB — we just broadcast to OTHER clients
        socket.on("field_added", ({ formId, field }) => {
            socket.to(formId).emit("field_added", { field, addedBy: socket.user.id });
        });

        // ── field_updated ────────────────────────────────────────────────────────
        // Payload: { formId, fieldId, updates }
        socket.on("field_updated", ({ formId, fieldId, updates }) => {
            socket.to(formId).emit("field_updated", {
                fieldId,
                updates,
                updatedBy: socket.user.id,
            });
        });

        // ── field_deleted ────────────────────────────────────────────────────────
        // Payload: { formId, fieldId }
        socket.on("field_deleted", ({ formId, fieldId }) => {
            socket.to(formId).emit("field_deleted", {
                fieldId,
                deletedBy: socket.user.id,
            });
        });

        // ── fields_reordered ─────────────────────────────────────────────────────
        // Payload: { formId, orderedFields } — full ordered array
        socket.on("fields_reordered", ({ formId, orderedFields }) => {
            socket.to(formId).emit("fields_reordered", {
                orderedFields,
                reorderedBy: socket.user.id,
            });
        });

        // ── form_updated ─────────────────────────────────────────────────────────
        // Payload: { formId, updates } — title/description/publish changes
        socket.on("form_updated", ({ formId, updates }) => {
            socket.to(formId).emit("form_updated", {
                updates,
                updatedBy: socket.user.id,
            });
        });

        // ── disconnect ───────────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            if (socket.currentFormId) {
                handleLeave(socket, socket.currentFormId, io);
            }
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
};

// Helper — remove from presence and notify room
const handleLeave = (socket, formId, io) => {
    socket.leave(formId);
    if (presence[formId]) {
        delete presence[formId][socket.id];
        // Clean up empty rooms
        if (Object.keys(presence[formId]).length === 0) {
            delete presence[formId];
        } else {
            io.to(formId).emit("presence_update", {
                users: Object.values(presence[formId]),
            });
        }
    }
    console.log(`👋 ${socket.user.name} left form ${formId}`);
};

module.exports = { initSocket };
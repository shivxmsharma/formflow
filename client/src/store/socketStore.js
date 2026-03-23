import { create } from "zustand";
import socket from "../socket/socket";

const useSocketStore = create((set, get) => ({
    // List of users currently in the same form room
    // [{ id, name, email, color }]
    onlineUsers: [],
    isConnected: false,

    // ── Connect and join a form room ──────────────────────────────────────────
    joinForm: (formId) => {
        if (!socket.connected) {
            socket.connect();
        }

        // Wait for connection then join the room
        socket.once("connect", () => {
            socket.emit("join_form", { formId });
            set({ isConnected: true });
        });

        // If already connected, join immediately
        if (socket.connected) {
            socket.emit("join_form", { formId });
            set({ isConnected: true });
        }

        // Track connection state changes
        socket.on("connect", () => set({ isConnected: true }));
        socket.on("disconnect", () => set({ isConnected: false }));
    },

    // ── Leave room and disconnect ─────────────────────────────────────────────
    leaveForm: (formId) => {
        socket.emit("leave_form", { formId });
        socket.disconnect();
        set({ onlineUsers: [], isConnected: false });
    },

    // ── Presence ──────────────────────────────────────────────────────────────
    setOnlineUsers: (users) => set({ onlineUsers: users }),

    // ── Emit helpers — called by BuilderPage after local state is updated ─────
    emitFieldAdded: (formId, field) => {
        socket.emit("field_added", { formId, field });
    },

    emitFieldUpdated: (formId, fieldId, updates) => {
        socket.emit("field_updated", { formId, fieldId, updates });
    },

    emitFieldDeleted: (formId, fieldId) => {
        socket.emit("field_deleted", { formId, fieldId });
    },

    emitFieldsReordered: (formId, orderedFields) => {
        socket.emit("fields_reordered", { formId, orderedFields });
    },

    emitFormUpdated: (formId, updates) => {
        socket.emit("form_updated", { formId, updates });
    },
}));

export default useSocketStore;
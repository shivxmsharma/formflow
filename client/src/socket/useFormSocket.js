import { useEffect } from "react";
import socket from "./socket";
import useSocketStore from "../store/socketStore";
import useFormStore from "../store/formStore";

// Encapsulates all socket event wiring for the builder
// Call this once inside BuilderPage — it handles connect, listen, cleanup
const useFormSocket = (formId) => {
    const { joinForm, leaveForm, setOnlineUsers } = useSocketStore();

    // formStore actions for applying remote mutations to local state
    const { activeFields } = useFormStore();
    const setActiveFields = (fields) =>
        useFormStore.setState({ activeFields: fields });
    const setActiveForm = (updates) =>
        useFormStore.setState((s) => ({
            activeForm: s.activeForm ? { ...s.activeForm, ...updates } : s.activeForm,
        }));

    useEffect(() => {
        if (!formId) return;

        // Join the Socket.io room for this form
        joinForm(formId);

        // ── Incoming event handlers ──────────────────────────────────────────────

        // Another user added a field — append it to our local list
        socket.on("field_added", ({ field }) => {
            useFormStore.setState((s) => ({
                activeFields: [...s.activeFields, field],
            }));
        });

        // Another user updated a field's properties — merge into local state
        socket.on("field_updated", ({ fieldId, updates }) => {
            useFormStore.setState((s) => ({
                activeFields: s.activeFields.map((f) =>
                    f.id === fieldId ? { ...f, ...updates } : f
                ),
            }));
        });

        // Another user deleted a field
        socket.on("field_deleted", ({ fieldId }) => {
            useFormStore.setState((s) => ({
                activeFields: s.activeFields.filter((f) => f.id !== fieldId),
                // Deselect if the deleted field was selected
                selectedFieldId:
                    s.selectedFieldId === fieldId ? null : s.selectedFieldId,
            }));
        });

        // Another user reordered fields — replace our entire ordered list
        socket.on("fields_reordered", ({ orderedFields }) => {
            useFormStore.setState({ activeFields: orderedFields });
        });

        // Another user changed the form title/description/publish state
        socket.on("form_updated", ({ updates }) => {
            useFormStore.setState((s) => ({
                activeForm: s.activeForm ? { ...s.activeForm, ...updates } : s.activeForm,
            }));
        });

        // Presence list updated — someone joined or left
        socket.on("presence_update", ({ users }) => {
            setOnlineUsers(users);
        });

        // ── Cleanup on unmount ──────────────────────────────────────────────────
        return () => {
            leaveForm(formId);
            socket.off("field_added");
            socket.off("field_updated");
            socket.off("field_deleted");
            socket.off("fields_reordered");
            socket.off("form_updated");
            socket.off("presence_update");
        };
    }, [formId]);
};

export default useFormSocket;
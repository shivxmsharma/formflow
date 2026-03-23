import { create } from "zustand";
import {
    fetchForms, fetchForm, createForm, updateForm,
    deleteForm, addField, updateField, deleteField, reorderFields,
} from "../api/forms.api";

const useFormStore = create((set, get) => ({
    // ─── Dashboard state ────────────────────────────────────────────────────
    forms: [],
    formsLoading: false,

    // ─── Builder state ──────────────────────────────────────────────────────
    activeForm: null,       // the form being edited
    activeFields: [],       // fields in current sort_order
    selectedFieldId: null,  // which field is open in the editor panel
    builderLoading: false,
    isSaving: false,

    // ─── Dashboard actions ──────────────────────────────────────────────────
    loadForms: async () => {
        set({ formsLoading: true });
        try {
            const { data } = await fetchForms();
            set({ forms: data.forms });
        } finally {
            set({ formsLoading: false });
        }
    },

    createNewForm: async (title) => {
        const { data } = await createForm({ title });
        set((s) => ({ forms: [{ ...data.form, fieldCount: 0, role: "owner" }, ...s.forms] }));
        return data.form;
    },

    removeForm: async (id) => {
        await deleteForm(id);
        set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
    },

    // ─── Builder actions ─────────────────────────────────────────────────────
    loadForm: async (id) => {
        set({ builderLoading: true, activeForm: null, activeFields: [], selectedFieldId: null });
        try {
            const { data } = await fetchForm(id);
            set({
                activeForm: data.form,
                activeFields: data.form.fields || [],
            });
        } finally {
            set({ builderLoading: false });
        }
    },

    updateActiveForm: async (id, updates) => {
        // Optimistic update
        set((s) => ({ activeForm: s.activeForm ? { ...s.activeForm, ...updates } : s.activeForm }));
        set({ isSaving: true });
        try {
            const { data } = await updateForm(id, updates);
            set({ activeForm: data.form });
        } finally {
            set({ isSaving: false });
        }
    },

    // Add a new field of a given type
    addNewField: async (formId, fieldType) => {
        const { activeFields } = get();
        const { data } = await addField(formId, {
            field_type: fieldType,
            label: getDefaultLabel(fieldType),
            sort_order: activeFields.length,
        });
        set((s) => ({
            activeFields: [...s.activeFields, data.field],
            selectedFieldId: data.field.id,
        }));
        return data.field;
    },

    // Update a field's properties (called from FieldEditor on every change)
    updateActiveField: async (formId, fieldId, updates) => {
        // Optimistic: update local state immediately for snappy UI
        set((s) => ({
            activeFields: s.activeFields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
            ),
        }));
        set({ isSaving: true });
        try {
            await updateField(formId, fieldId, updates);
        } finally {
            set({ isSaving: false });
        }
    },

    removeField: async (formId, fieldId) => {
        // Optimistic
        set((s) => ({
            activeFields: s.activeFields.filter((f) => f.id !== fieldId),
            selectedFieldId: s.selectedFieldId === fieldId ? null : s.selectedFieldId,
        }));
        await deleteField(formId, fieldId);
    },

    // Called after dnd-kit fires an onDragEnd event
    reorderActiveFields: async (formId, newOrderedFields) => {
        set({ activeFields: newOrderedFields });
        await reorderFields(formId, newOrderedFields.map((f) => f.id));
    },

    selectField: (id) => set({ selectedFieldId: id }),
    clearSelectedField: () => set({ selectedFieldId: null }),
    clearBuilder: () => set({ activeForm: null, activeFields: [], selectedFieldId: null }),
}));

// Default labels for each field type
const getDefaultLabel = (type) => {
    const map = {
        text: "Short answer",
        email: "Email address",
        number: "Number",
        textarea: "Long answer",
        radio: "Multiple choice",
        checkbox: "Checkboxes",
        dropdown: "Dropdown",
        date: "Date",
    };
    return map[type] || "Question";
};

export default useFormStore;
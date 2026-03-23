const { FormField, Form, FormCollaborator } = require("../models");

// Helper: check if user has edit access to a form
const canEdit = async (formId, userId) => {
    const form = await Form.findByPk(formId);
    if (!form) return { allowed: false, status: 404, message: "Form not found" };

    const isOwner = form.owner_id === userId;
    if (isOwner) return { allowed: true, form };

    const collab = await FormCollaborator.findOne({
        where: { form_id: formId, user_id: userId, role: "editor" },
    });
    if (collab) return { allowed: true, form };

    return { allowed: false, status: 403, message: "Access denied" };
};

// ─── POST /api/forms/:formId/fields ──────────────────────────────────────────
const addField = async (req, res) => {
    try {
        const { allowed, form, status, message } = await canEdit(req.params.formId, req.user.id);
        if (!allowed) return res.status(status).json({ message });

        const { field_type = "text", label, options, placeholder, required, sort_order } = req.body;

        // Put new field at end if no sort_order provided
        let order = sort_order;
        if (order === undefined) {
            const count = await FormField.count({ where: { form_id: form.id } });
            order = count;
        }

        const field = await FormField.create({
            form_id: form.id,
            field_type,
            label: label || "Untitled question",
            options: options || null,
            placeholder: placeholder || null,
            required: required || false,
            sort_order: order,
        });

        return res.status(201).json({ field });
    } catch (err) {
        console.error("addField error:", err);
        return res.status(500).json({ message: "Failed to add field" });
    }
};

// ─── PATCH /api/forms/:formId/fields/:fieldId ─────────────────────────────────
const updateField = async (req, res) => {
    try {
        const { allowed, status, message } = await canEdit(req.params.formId, req.user.id);
        if (!allowed) return res.status(status).json({ message });

        const field = await FormField.findOne({
            where: { id: req.params.fieldId, form_id: req.params.formId },
        });
        if (!field) return res.status(404).json({ message: "Field not found" });

        const { label, options, placeholder, required, field_type } = req.body;
        if (label !== undefined) field.label = label;
        if (options !== undefined) field.options = options;
        if (placeholder !== undefined) field.placeholder = placeholder;
        if (required !== undefined) field.required = required;
        if (field_type !== undefined) field.field_type = field_type;

        await field.save();
        return res.json({ field });
    } catch (err) {
        console.error("updateField error:", err);
        return res.status(500).json({ message: "Failed to update field" });
    }
};

// ─── DELETE /api/forms/:formId/fields/:fieldId ────────────────────────────────
const deleteField = async (req, res) => {
    try {
        const { allowed, status, message } = await canEdit(req.params.formId, req.user.id);
        if (!allowed) return res.status(status).json({ message });

        const field = await FormField.findOne({
            where: { id: req.params.fieldId, form_id: req.params.formId },
        });
        if (!field) return res.status(404).json({ message: "Field not found" });

        await field.destroy();

        // Re-normalize sort_order so there are no gaps after deletion
        const remaining = await FormField.findAll({
            where: { form_id: req.params.formId },
            order: [["sort_order", "ASC"]],
        });
        await Promise.all(
            remaining.map((f, idx) => {
                f.sort_order = idx;
                return f.save();
            })
        );

        return res.json({ message: "Field deleted" });
    } catch (err) {
        console.error("deleteField error:", err);
        return res.status(500).json({ message: "Failed to delete field" });
    }
};

// ─── PATCH /api/forms/:formId/fields/reorder ──────────────────────────────────
// Body: { orderedIds: ["id1", "id2", "id3"] }
// Sets sort_order based on array position — called after every drag-and-drop
const reorderFields = async (req, res) => {
    try {
        const { allowed, status, message } = await canEdit(req.params.formId, req.user.id);
        if (!allowed) return res.status(status).json({ message });

        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ message: "orderedIds must be an array" });
        }

        // Update each field's sort_order in parallel
        await Promise.all(
            orderedIds.map((id, index) =>
                FormField.update(
                    { sort_order: index },
                    { where: { id, form_id: req.params.formId } }
                )
            )
        );

        return res.json({ message: "Fields reordered" });
    } catch (err) {
        console.error("reorderFields error:", err);
        return res.status(500).json({ message: "Failed to reorder fields" });
    }
};

module.exports = { addField, updateField, deleteField, reorderFields };
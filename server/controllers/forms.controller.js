const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const { Form, FormField, FormCollaborator, User } = require("../models");

// ─── GET /api/forms ───────────────────────────────────────────────────────────
// Returns all forms owned by OR collaborated on by the logged-in user
const getForms = async (req, res) => {
    try {
        // Forms the user owns
        const ownedForms = await Form.findAll({
            where: { owner_id: req.user.id },
            include: [
                { model: FormField, as: "fields", attributes: ["id"] },
            ],
            order: [["created_at", "DESC"]],
        });

        // Forms where user is a collaborator
        const collabEntries = await FormCollaborator.findAll({
            where: { user_id: req.user.id },
        });
        const collabFormIds = collabEntries.map((c) => c.form_id);

        let collabForms = [];
        if (collabFormIds.length > 0) {
            const { Op } = require("sequelize");
            collabForms = await Form.findAll({
                where: { id: { [Op.in]: collabFormIds } },
                include: [
                    { model: User, as: "owner", attributes: ["id", "name", "email"] },
                    { model: FormField, as: "fields", attributes: ["id"] },
                ],
                order: [["created_at", "DESC"]],
            });
        }

        // Annotate owned forms with field count and role
        const owned = ownedForms.map((f) => ({
            ...f.toJSON(),
            fieldCount: f.fields.length,
            role: "owner",
        }));

        const collab = collabForms.map((f) => ({
            ...f.toJSON(),
            fieldCount: f.fields.length,
            role: "collaborator",
        }));

        return res.json({ forms: [...owned, ...collab] });
    } catch (err) {
        console.error("getForms error:", err);
        return res.status(500).json({ message: "Failed to fetch forms" });
    }
};

// ─── POST /api/forms ──────────────────────────────────────────────────────────
const createForm = async (req, res) => {
    try {
        const { title, description } = req.body;
        const form = await Form.create({
            owner_id: req.user.id,
            title: title || "Untitled Form",
            description: description || "",
        });

        return res.status(201).json({ form });
    } catch (err) {
        console.error("createForm error:", err);
        return res.status(500).json({ message: "Failed to create form" });
    }
};

// ─── GET /api/forms/:id ───────────────────────────────────────────────────────
// Returns form with all fields — used by the builder
const getForm = async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id, {
            include: [
                {
                    model: FormField,
                    as: "fields",
                    order: [["sort_order", "ASC"]],
                },
                { model: User, as: "owner", attributes: ["id", "name", "email"] },
            ],
        });

        if (!form) return res.status(404).json({ message: "Form not found" });

        // Check access: owner or collaborator
        const isOwner = form.owner_id === req.user.id;
        const collab = await FormCollaborator.findOne({
            where: { form_id: form.id, user_id: req.user.id },
        });

        if (!isOwner && !collab) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Sort fields by sort_order
        const sorted = { ...form.toJSON() };
        sorted.fields = sorted.fields.sort((a, b) => a.sort_order - b.sort_order);

        return res.json({ form: sorted, role: isOwner ? "owner" : collab.role });
    } catch (err) {
        console.error("getForm error:", err);
        return res.status(500).json({ message: "Failed to fetch form" });
    }
};

// ─── PATCH /api/forms/:id ─────────────────────────────────────────────────────
// Update title, description, or publish status
const updateForm = async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id);
        if (!form) return res.status(404).json({ message: "Form not found" });
        if (form.owner_id !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can update form settings" });
        }

        const { title, description, is_published } = req.body;
        if (title !== undefined) form.title = title;
        if (description !== undefined) form.description = description;

        // Publishing: generate a share token if not already set
        if (is_published === true && !form.share_token) {
            form.share_token = uuidv4().replace(/-/g, "");
        }
        if (is_published !== undefined) form.is_published = is_published;

        await form.save();
        return res.json({ form });
    } catch (err) {
        console.error("updateForm error:", err);
        return res.status(500).json({ message: "Failed to update form" });
    }
};

// ─── DELETE /api/forms/:id ────────────────────────────────────────────────────
const deleteForm = async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id);
        if (!form) return res.status(404).json({ message: "Form not found" });
        if (form.owner_id !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can delete this form" });
        }

        await form.destroy(); // cascades to fields, collaborators, responses
        return res.json({ message: "Form deleted" });
    } catch (err) {
        console.error("deleteForm error:", err);
        return res.status(500).json({ message: "Failed to delete form" });
    }
};

// ─── POST /api/forms/:id/collaborators ────────────────────────────────────────
// Add a collaborator by user ID (anyone with the builder link joins via socket — this is for explicit adds)
const addCollaborator = async (req, res) => {
    try {
        const { user_id, role = "editor" } = req.body;
        const form = await Form.findByPk(req.params.id);
        if (!form) return res.status(404).json({ message: "Form not found" });
        if (form.owner_id !== req.user.id) {
            return res.status(403).json({ message: "Only owner can add collaborators" });
        }
        if (user_id === req.user.id) {
            return res.status(400).json({ message: "You are already the owner" });
        }

        const [collab, created] = await FormCollaborator.findOrCreate({
            where: { form_id: form.id, user_id },
            defaults: { role },
        });

        return res.status(created ? 201 : 200).json({ collaborator: collab });
    } catch (err) {
        console.error("addCollaborator error:", err);
        return res.status(500).json({ message: "Failed to add collaborator" });
    }
};

module.exports = { getForms, createForm, getForm, updateForm, deleteForm, addCollaborator };
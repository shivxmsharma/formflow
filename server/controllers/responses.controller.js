const { Form, FormField, FormResponse, ResponseAnswer, FormCollaborator } = require("../models");
const { Op } = require("sequelize");

// ─── GET /api/public/:token ───────────────────────────────────────────────────
// Fetch a published form by its share token — no auth required
const getPublicForm = async (req, res) => {
    try {
        const form = await Form.findOne({
            where: { share_token: req.params.token, is_published: true },
            include: [
                {
                    model: FormField,
                    as: "fields",
                    order: [["sort_order", "ASC"]],
                },
            ],
        });

        if (!form) {
            return res.status(404).json({ message: "Form not found or not published" });
        }

        const data = form.toJSON();
        data.fields = data.fields.sort((a, b) => a.sort_order - b.sort_order);

        // Strip owner info from public response
        return res.json({ form: data });
    } catch (err) {
        console.error("getPublicForm error:", err);
        return res.status(500).json({ message: "Failed to fetch form" });
    }
};

// ─── POST /api/public/:token/submit ──────────────────────────────────────────
// Submit a response — no auth required
const submitResponse = async (req, res) => {
    try {
        const form = await Form.findOne({
            where: { share_token: req.params.token, is_published: true },
            include: [{ model: FormField, as: "fields" }],
        });

        if (!form) {
            return res.status(404).json({ message: "Form not found or not published" });
        }

        const { answers, respondent_email } = req.body;
        // answers: { fieldId: value } — value is string or array for checkboxes

        // Validate required fields
        const requiredFields = form.fields.filter((f) => f.required);
        for (const field of requiredFields) {
            const answer = answers?.[field.id];
            const isEmpty =
                answer === undefined ||
                answer === null ||
                answer === "" ||
                (Array.isArray(answer) && answer.length === 0);
            if (isEmpty) {
                return res.status(400).json({
                    message: `"${field.label}" is required`,
                    fieldId: field.id,
                });
            }
        }

        // Create the response record
        const response = await FormResponse.create({
            form_id: form.id,
            respondent_email: respondent_email || null,
        });

        // Create an answer row for each field that has a value
        if (answers && typeof answers === "object") {
            const answerRows = Object.entries(answers)
                .filter(([, value]) => value !== undefined && value !== null && value !== "")
                .map(([field_id, value]) => ({
                    response_id: response.id,
                    field_id,
                    // Store arrays (checkbox) as JSON string
                    value: Array.isArray(value) ? JSON.stringify(value) : String(value),
                }));

            await ResponseAnswer.bulkCreate(answerRows);
        }

        return res.status(201).json({ message: "Response submitted successfully" });
    } catch (err) {
        console.error("submitResponse error:", err);
        return res.status(500).json({ message: "Failed to submit response" });
    }
};

// ─── GET /api/forms/:id/responses ────────────────────────────────────────────
// Get all responses for a form — requires auth + ownership/collaboration
const getResponses = async (req, res) => {
    try {
        const form = await Form.findByPk(req.params.id);
        if (!form) return res.status(404).json({ message: "Form not found" });

        const isOwner = form.owner_id === req.user.id;
        const collab = await FormCollaborator.findOne({
            where: { form_id: form.id, user_id: req.user.id },
        });
        if (!isOwner && !collab) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Fetch all responses with their answers and field info
        const responses = await FormResponse.findAll({
            where: { form_id: form.id },
            include: [
                {
                    model: ResponseAnswer,
                    as: "answers",
                    include: [{ model: FormField, as: "field", attributes: ["id", "label", "field_type"] }],
                },
            ],
            order: [["submitted_at", "DESC"]],
        });

        // Fetch fields for column headers
        const fields = await FormField.findAll({
            where: { form_id: form.id },
            order: [["sort_order", "ASC"]],
        });

        // Build analytics: per-field response counts for radio/checkbox/dropdown
        const analytics = {};
        for (const field of fields) {
            if (["radio", "checkbox", "dropdown"].includes(field.field_type)) {
                analytics[field.id] = { label: field.label, type: field.field_type, counts: {} };
            }
        }

        for (const response of responses) {
            for (const answer of response.answers) {
                if (analytics[answer.field_id]) {
                    let values = [answer.value];
                    // Parse checkbox JSON arrays
                    try {
                        const parsed = JSON.parse(answer.value);
                        if (Array.isArray(parsed)) values = parsed;
                    } catch { }

                    for (const v of values) {
                        analytics[answer.field_id].counts[v] =
                            (analytics[answer.field_id].counts[v] || 0) + 1;
                    }
                }
            }
        }

        return res.json({
            form: { id: form.id, title: form.title },
            fields,
            responses,
            analytics,
            total: responses.length,
        });
    } catch (err) {
        console.error("getResponses error:", err);
        return res.status(500).json({ message: "Failed to fetch responses" });
    }
};

module.exports = { getPublicForm, submitResponse, getResponses };
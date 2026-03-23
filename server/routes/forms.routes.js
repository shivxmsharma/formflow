const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
    getForms, createForm, getForm, updateForm, deleteForm, addCollaborator,
} = require("../controllers/forms.controller");
const {
    addField, updateField, deleteField, reorderFields,
} = require("../controllers/fields.controller");

const router = express.Router();

// All form routes are protected
router.use(protect);

// ─── Form CRUD ────────────────────────────────────────────────────────────────
router.get("/", getForms);
router.post("/", createForm);
router.get("/:id", getForm);
router.patch("/:id", updateForm);
router.delete("/:id", deleteForm);
router.post("/:id/collaborators", addCollaborator);

// ─── Field routes (nested under forms) ───────────────────────────────────────
// IMPORTANT: /reorder must come before /:fieldId or Express matches "reorder" as a fieldId
router.patch("/:formId/fields/reorder", reorderFields);
router.post("/:formId/fields", addField);
router.patch("/:formId/fields/:fieldId", updateField);
router.delete("/:formId/fields/:fieldId", deleteField);

module.exports = router;
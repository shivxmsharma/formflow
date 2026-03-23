const express = require("express");
const { getPublicForm, submitResponse } = require("../controllers/responses.controller");

const router = express.Router();

// No auth middleware — these are public endpoints
router.get("/:token", getPublicForm);
router.post("/:token/submit", submitResponse);

module.exports = router;
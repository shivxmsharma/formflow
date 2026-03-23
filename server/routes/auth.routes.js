const express = require("express");
const { body } = require("express-validator");
const { register, login, refresh, logout, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Validation rule sets — reusable, kept separate from controller logic
const registerRules = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be 2–100 characters"),
    body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
];

const loginRules = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.post("/refresh", refresh);       // uses httpOnly cookie
router.post("/logout", logout);         // clears cookie
router.get("/me", protect, me);         // protected — requires valid access token

module.exports = router;
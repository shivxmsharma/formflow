const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User } = require("../models");
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require("../config/jwt");

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
    // 1. Check validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // 2. Check if email already exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // 3. Hash password — salt rounds 12 is the sweet spot (secure, not too slow)
        const password_hash = await bcrypt.hash(password, 12);

        // 4. Create user
        const user = await User.create({ name, email, password_hash });

        // 5. Issue tokens immediately so user is logged in right after registering
        const payload = { id: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        // 6. Set refresh token as httpOnly cookie (can't be read by JS — XSS safe)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });

        return res.status(201).json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 1. Find user — use vague error message to prevent email enumeration attacks
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Issue tokens
        const payload = { id: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};

// ─── Refresh ──────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// Frontend calls this when accessToken expires (gets 401) to silently get a new one
const refresh = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = verifyRefreshToken(token);

        // Verify user still exists in DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const payload = { id: user.id, email: user.email };
        const accessToken = signAccessToken(payload);

        return res.status(200).json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
// POST /api/auth/logout
const logout = async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};

// ─── Me ───────────────────────────────────────────────────────────────────────
// GET /api/auth/me — returns logged-in user from the access token
const me = async (req, res) => {
    // req.user is set by auth middleware
    return res.status(200).json({ user: req.user });
};

module.exports = { register, login, refresh, logout, me };
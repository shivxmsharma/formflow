require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

require("./models");

const authRoutes = require("./routes/auth.routes");
const formsRoutes = require("./routes/forms.routes");
const publicRoutes = require("./routes/public.routes");
const { getResponses } = require("./controllers/responses.controller");
const { protect } = require("./middleware/auth.middleware");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production the frontend is served by this same Express server
// so CORS is only needed for development (Vite dev server on :5173)
app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? false  // same origin — no CORS needed
        : process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── API routes ────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/public", publicRoutes);
app.get("/api/forms/:id/responses", protect, getResponses);

// ── Serve React frontend in production ────────────────────────────────────────
// client/dist is built by `npm run build` before deploying
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../client/dist");

    // Serve static assets (JS, CSS, images)
    app.use(express.static(distPath));

    // Any route that isn't an API call gets the React index.html
    // This allows React Router to handle client-side navigation
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// ── Error handling (always last) ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
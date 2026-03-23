// Centralized error handler — always the LAST middleware registered in app.js
const errorHandler = (err, req, res, next) => {
    // Don't log 4xx errors in production — only real server errors
    if (process.env.NODE_ENV !== "production" || (err.status && err.status >= 500)) {
        console.error(`[Error] ${req.method} ${req.path}:`, err.message);
    }

    // Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            message: "Validation error",
            errors: err.errors.map((e) => e.message),
        });
    }

    // Sequelize unique constraint
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "A record with this value already exists" });
    }

    // Sequelize foreign key constraint
    if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({ message: "Referenced record does not exist" });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }

    // Default fallback — never expose stack traces in production
    const status = err.status || err.statusCode || 500;
    return res.status(status).json({
        message:
            process.env.NODE_ENV === "production" && status === 500
                ? "Internal server error"
                : err.message || "Internal server error",
    });
};

// 404 handler — registered BEFORE errorHandler but AFTER all routes
const notFound = (req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };
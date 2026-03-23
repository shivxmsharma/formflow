const { verifyAccessToken } = require("../config/jwt");
const { User } = require("../models");

const protect = async (req, res, next) => {
    // 1. Pull token from Authorization: Bearer <token> header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verify and decode
        const decoded = verifyAccessToken(token);

        // 3. Attach user to request so controllers can use it
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "name", "email", "created_at"],
        });

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { protect };
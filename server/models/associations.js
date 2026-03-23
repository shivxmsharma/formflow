const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// ─── FormCollaborator ────────────────────────────────────────────────────────
// Tracks which users have access to edit a form
const FormCollaborator = sequelize.define(
    "FormCollaborator",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        form_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("editor", "viewer"),
            defaultValue: "editor",
        },
    },
    {
        tableName: "form_collaborators",
        timestamps: true,
        createdAt: "joined_at",
        updatedAt: false,
    }
);

// ─── FormResponse ─────────────────────────────────────────────────────────────
// One row per form submission
const FormResponse = sequelize.define(
    "FormResponse",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        form_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        respondent_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "form_responses",
        timestamps: true,
        createdAt: "submitted_at",
        updatedAt: false,
    }
);

// ─── ResponseAnswer ───────────────────────────────────────────────────────────
// One row per field answer within a response
const ResponseAnswer = sequelize.define(
    "ResponseAnswer",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        response_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        field_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // For multi-select (checkbox), store as JSON array: ["A","B"]
        // For all other types, plain string
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "response_answers",
        timestamps: false,
    }
);

module.exports = { FormCollaborator, FormResponse, ResponseAnswer };
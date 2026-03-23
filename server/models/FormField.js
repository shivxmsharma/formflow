const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FormField = sequelize.define(
    "FormField",
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
        field_type: {
            type: DataTypes.ENUM(
                "text",
                "email",
                "number",
                "textarea",
                "radio",
                "checkbox",
                "dropdown",
                "date"
            ),
            allowNull: false,
        },
        label: {
            type: DataTypes.STRING(300),
            allowNull: false,
            defaultValue: "Untitled Question",
        },
        // Stores options array for radio / checkbox / dropdown
        // e.g. ["Option 1", "Option 2", "Option 3"]
        options: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        placeholder: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // Controls the visual order in the builder
        sort_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "form_fields",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = FormField;
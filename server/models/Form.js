const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Form = sequelize.define(
    "Form",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        owner_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: "Untitled Form",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // Random token used in the public share URL: /f/:share_token
        share_token: {
            type: DataTypes.STRING(64),
            allowNull: true,
            unique: true,
        },
    },
    {
        tableName: "forms",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Form;
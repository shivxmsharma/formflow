// Central place to import all models and define their relationships.
// Always require THIS file, never individual models directly.

const User = require("./User");
const Form = require("./Form");
const FormField = require("./FormField");
const { FormCollaborator, FormResponse, ResponseAnswer } = require("./associations");

// ─── Associations ─────────────────────────────────────────────────────────────

// A user owns many forms
User.hasMany(Form, { foreignKey: "owner_id", as: "forms", onDelete: "CASCADE" });
Form.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

// A form has many fields
Form.hasMany(FormField, { foreignKey: "form_id", as: "fields", onDelete: "CASCADE" });
FormField.belongsTo(Form, { foreignKey: "form_id", as: "form" });

// A form has many collaborators
Form.hasMany(FormCollaborator, { foreignKey: "form_id", as: "collaborators", onDelete: "CASCADE" });
FormCollaborator.belongsTo(Form, { foreignKey: "form_id" });
FormCollaborator.belongsTo(User, { foreignKey: "user_id", as: "user" });

// A form has many responses
Form.hasMany(FormResponse, { foreignKey: "form_id", as: "responses", onDelete: "CASCADE" });
FormResponse.belongsTo(Form, { foreignKey: "form_id" });

// A response has many answers
FormResponse.hasMany(ResponseAnswer, { foreignKey: "response_id", as: "answers", onDelete: "CASCADE" });
ResponseAnswer.belongsTo(FormResponse, { foreignKey: "response_id" });
ResponseAnswer.belongsTo(FormField, { foreignKey: "field_id", as: "field" });

module.exports = {
    User,
    Form,
    FormField,
    FormCollaborator,
    FormResponse,
    ResponseAnswer,
};
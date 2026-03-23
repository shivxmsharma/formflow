import api from "./axios";

// Forms
export const fetchForms = () => api.get("/forms");
export const fetchForm = (id) => api.get(`/forms/${id}`);
export const createForm = (data) => api.post("/forms", data);
export const updateForm = (id, data) => api.patch(`/forms/${id}`, data);
export const deleteForm = (id) => api.delete(`/forms/${id}`);

// Fields
export const addField = (formId, data) => api.post(`/forms/${formId}/fields`, data);
export const updateField = (formId, fieldId, data) =>
    api.patch(`/forms/${formId}/fields/${fieldId}`, data);
export const deleteField = (formId, fieldId) =>
    api.delete(`/forms/${formId}/fields/${fieldId}`);
export const reorderFields = (formId, orderedIds) =>
    api.patch(`/forms/${formId}/fields/reorder`, { orderedIds });

// Responses
export const fetchResponses = (formId) =>
    api.get(`/forms/${formId}/responses`);
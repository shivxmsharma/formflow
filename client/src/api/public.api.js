import axios from "axios";

// Same as main api — use relative path so it works in both dev and production
const publicApi = axios.create({
    baseURL: "/api/public",
});

export const fetchPublicForm = (token) =>
    publicApi.get(`/${token}`);

export const submitFormResponse = (token, data) =>
    publicApi.post(`/${token}/submit`, data);
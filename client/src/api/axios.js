import axios from "axios";

// In development Vite proxies /api to localhost:5000
// In production the same Express server serves both API and frontend
// So we always use relative /api — no hardcoded URLs needed
const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        const isExpired =
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !original._retried;

        if (isExpired) {
            original._retried = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        return api(original);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;
            try {
                const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
                const newToken = data.accessToken;
                setAccessToken(newToken);
                refreshQueue.forEach(({ resolve }) => resolve(newToken));
                refreshQueue = [];
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (refreshError) {
                refreshQueue.forEach(({ reject }) => reject(refreshError));
                refreshQueue = [];
                clearAccessToken();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ── In-memory token storage ───────────────────────────────────────────────────
let _accessToken = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

export default api;
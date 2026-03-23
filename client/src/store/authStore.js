import { create } from "zustand";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
} from "../api/auth.api";
import { setAccessToken, clearAccessToken } from "../api/axios";

const useAuthStore = create((set) => ({
    // ─── State ─────────────────────────────────────────────────────────────────
    user: null,
    isAuthenticated: false,
    isLoading: true, // true on app init while we check for an existing session

    // ─── Actions ───────────────────────────────────────────────────────────────

    // Called on app mount — tries to restore session via the httpOnly cookie
    initAuth: async () => {
        try {
            const { data } = await refreshToken();
            setAccessToken(data.accessToken);
            set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch {
            // No valid session — user needs to log in
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    register: async (name, email, password) => {
        const { data } = await registerUser({ name, email, password });
        setAccessToken(data.accessToken);
        set({ user: data.user, isAuthenticated: true });
        return data;
    },

    login: async (email, password) => {
        const { data } = await loginUser({ email, password });
        setAccessToken(data.accessToken);
        set({ user: data.user, isAuthenticated: true });
        return data;
    },

    logout: async () => {
        try {
            await logoutUser();
        } catch {
            // Even if the server call fails, clear local state
        } finally {
            clearAccessToken();
            set({ user: null, isAuthenticated: false });
        }
    },
}));

export default useAuthStore;
import { create } from "zustand";

// Reads saved preference, falls back to OS preference
const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
};

const useThemeStore = create((set) => {
    // Apply immediately on store creation (before first render)
    const initial = getInitialTheme();
    applyTheme(initial);

    return {
        theme: initial,

        toggleTheme: () =>
            set((state) => {
                const next = state.theme === "dark" ? "light" : "dark";
                applyTheme(next);
                return { theme: next };
            }),
    };
});

export default useThemeStore;
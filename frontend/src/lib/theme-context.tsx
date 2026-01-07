"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("atlas-theme") as Theme | null;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("atlas-theme", theme);
            document.documentElement.setAttribute("data-theme", theme);

            // Apply theme to body
            if (theme === "light") {
                document.body.style.background = "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)";
                document.body.style.color = "#1e293b";
            } else {
                document.body.style.background = "linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 8%) 100%)";
                document.body.style.color = "#f1f5f9";
            }
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setThemeState(prev => prev === "dark" ? "light" : "dark");
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

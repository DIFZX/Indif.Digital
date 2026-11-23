"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("indif-theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Default to dark mode
        setThemeState("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      // fallback to dark
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);
      try {
        localStorage.setItem("indif-theme", newTheme);
      } catch {
        // ignore
      }
      document.documentElement.setAttribute("data-theme", newTheme);
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

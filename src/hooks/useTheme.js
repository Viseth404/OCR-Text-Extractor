import { useState, useEffect } from "react";

const THEME_KEY = "theme";

function getInitialDarkMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    try {
      localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
    } catch {}
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme: () => setIsDarkMode((prev) => !prev) };
}

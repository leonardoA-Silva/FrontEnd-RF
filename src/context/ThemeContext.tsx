import { useEffect, useState, type ReactNode } from "react";
import type { ThemeChoice, ActiveTheme } from "./themeTypes";
import { ThemeContext } from "./themeContextInstance";

const STORAGE_KEY = "rf_theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveActiveTheme(choice: ThemeChoice, isDark: boolean): ActiveTheme {
  if (choice === "claro" || choice === "escuro" || choice === "retro") {
    return choice;
  }
  return isDark ? "escuro" : "claro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeChoice, setThemeChoiceState] = useState<ThemeChoice>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "claro" || saved === "escuro" || saved === "retro" || saved === "automatico") {
        return saved;
      }
    } catch {
      // LocalStorage pode falhar em modo restrito
    }
    return "automatico";
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(getSystemPrefersDark);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const activeTheme = resolveActiveTheme(themeChoice, systemIsDark);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", activeTheme);
    root.classList.remove("theme-claro", "theme-escuro", "theme-retro");
    root.classList.add(`theme-${activeTheme}`);
  }, [activeTheme]);

  function setThemeChoice(choice: ThemeChoice) {
    setThemeChoiceState(choice);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ themeChoice, activeTheme, setThemeChoice }}>
      {children}
    </ThemeContext.Provider>
  );
}

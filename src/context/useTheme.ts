import { useContext } from "react";
import { ThemeContext } from "./themeContextInstance";
import type { ThemeContextValue } from "./themeTypes";

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return ctx;
}

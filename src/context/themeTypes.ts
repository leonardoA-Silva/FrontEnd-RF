export type ThemeChoice = "automatico" | "claro" | "escuro" | "retro";
export type ActiveTheme = "claro" | "escuro" | "retro";

export interface ThemeOption {
  id: ThemeChoice;
  title: string;
  text: string;
  palette: {
    background: string;
    primary: string;
    accent: string;
  } | null;
}

export interface ThemeContextValue {
  themeChoice: ThemeChoice;
  activeTheme: ActiveTheme;
  setThemeChoice: (choice: ThemeChoice) => void;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "automatico",
    title: "Automático",
    text: "Segue o modo claro ou escuro do seu sistema.",
    palette: null,
  },
  {
    id: "claro",
    title: "Claro",
    text: "Papel claro e verde floresta.",
    palette: {
      background: "#FAF9F5",
      primary: "#1B4B3A",
      accent: "#D97706",
    },
  },
  {
    id: "escuro",
    title: "Escuro",
    text: "Fundo escuro, mais leve para os olhos à noite.",
    palette: {
      background: "#0E1512",
      primary: "#7FC7A0",
      accent: "#F59E0B",
    },
  },
  {
    id: "retro",
    title: "Retrô",
    text: "Papel envelhecido, marrom café e laranja anos 70.",
    palette: {
      background: "#F3E7CF",
      primary: "#8A4B1F",
      accent: "#D9622B",
    },
  },
];

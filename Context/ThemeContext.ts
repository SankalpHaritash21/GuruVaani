export type Theme = "light" | "dark";

export type ThemeContextType = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

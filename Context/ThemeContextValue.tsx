import { createContext } from "react";
import type { ThemeContextType } from "./ThemeTypes";

export const ThemeContext = createContext<ThemeContextType | null>(null);

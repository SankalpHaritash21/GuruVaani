import { createContext } from "react";
import type { ThemeContextType } from "../contexts/ThemeTypes";

export const ThemeContext = createContext<ThemeContextType | null>(null);

import { createContext } from "react";
import { ThemeContextType } from "./ThemeContext";

export const ThemeContext = createContext<ThemeContextType | null>(null);

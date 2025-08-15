import { createContext } from "react";
import { ThemeContextType } from "./ThemeContext.d";

export const ThemeContext = createContext<ThemeContextType | null>(null);

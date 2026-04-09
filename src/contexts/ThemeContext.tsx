import { createContext, useContext, useEffect, ReactNode } from "react";

export type AccentColor = "purple" | "blue";

interface ThemeContextValue {
  theme: "dark";
  toggleTheme: () => void;
  accent: AccentColor;
  toggleAccent: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  accent: "purple",
  toggleAccent: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("dark");
    html.classList.remove("light");
    localStorage.removeItem("maris-theme");
  }, []);

  const toggleAccent = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {}, accent: "purple", toggleAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

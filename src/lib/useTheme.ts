import { useCallback, useEffect, useState } from "react";
import { loadTheme, saveTheme, type ThemeChoice } from "./storage";

/**
 * Theme state. "system" removes the attribute entirely so the CSS
 * `prefers-color-scheme` block takes over; the explicit choices stamp
 * `data-theme` on <html> and win in both directions.
 */
export function useTheme(): {
  theme: ThemeChoice;
  resolved: "light" | "dark";
  setTheme: (theme: ThemeChoice) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<ThemeChoice>(() =>
    typeof window === "undefined" ? "system" : loadTheme(),
  );
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    saveTheme(next);
  }, []);

  const resolved: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return { theme, resolved, setTheme, toggle };
}

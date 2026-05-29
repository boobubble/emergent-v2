import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "palrgo-theme-mode";

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return ((localStorage.getItem(KEY) as ThemeMode) || "light");
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>("light");
  useEffect(() => {
    const m = getStoredThemeMode();
    setMode(m);
    applyThemeMode(m);
  }, []);
  const choose = (m: ThemeMode) => {
    setMode(m);
    localStorage.setItem(KEY, m);
    applyThemeMode(m);
  };
  return { mode, setMode: choose };
}

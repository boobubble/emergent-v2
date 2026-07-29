import { r as reactExports } from "../_libs/react.mjs";
const KEY = "palrgo-theme-mode";
function applyThemeMode(mode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = mode === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : mode;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
}
function getStoredThemeMode() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(KEY) || "light";
}
function useThemeMode() {
  const [mode, setMode] = reactExports.useState("light");
  reactExports.useEffect(() => {
    const m = getStoredThemeMode();
    setMode(m);
    applyThemeMode(m);
  }, []);
  const choose = (m) => {
    setMode(m);
    localStorage.setItem(KEY, m);
    applyThemeMode(m);
  };
  return { mode, setMode: choose };
}
export {
  useThemeMode as u
};

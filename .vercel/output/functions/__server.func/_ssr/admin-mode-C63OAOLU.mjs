import { r as reactExports } from "../_libs/react.mjs";
const KEY = "admin.mode";
function read() {
  if (typeof window === "undefined") return "basic";
  return localStorage.getItem(KEY) || "basic";
}
function useAdminMode() {
  const [mode, setModeState] = reactExports.useState("basic");
  reactExports.useEffect(() => {
    setModeState(read());
  }, []);
  const setMode = (m) => {
    setModeState(m);
    if (typeof window !== "undefined") localStorage.setItem(KEY, m);
    window.dispatchEvent(new Event("admin-mode-changed"));
  };
  reactExports.useEffect(() => {
    const onChange = () => setModeState(read());
    window.addEventListener("admin-mode-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("admin-mode-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return { mode, setMode, isAdvanced: mode === "advanced" };
}
export {
  useAdminMode as u
};

import { useEffect, useState } from "react";

export type AdminMode = "basic" | "advanced";
const KEY = "admin.mode";

function read(): AdminMode {
  if (typeof window === "undefined") return "basic";
  return (localStorage.getItem(KEY) as AdminMode) || "basic";
}

export function useAdminMode() {
  const [mode, setModeState] = useState<AdminMode>("basic");
  useEffect(() => { setModeState(read()); }, []);
  const setMode = (m: AdminMode) => {
    setModeState(m);
    if (typeof window !== "undefined") localStorage.setItem(KEY, m);
    // notify listeners in same tab
    window.dispatchEvent(new Event("admin-mode-changed"));
  };
  useEffect(() => {
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

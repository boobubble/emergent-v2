import { useCallback, useEffect, useState } from "react";

export type IrcChatThemeMode = "light" | "dark";

function readTheme(): IrcChatThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyIrcChatTheme(mode: IrcChatThemeMode) {
  if (typeof document === "undefined") return;
  localStorage.setItem("palrgo-theme", mode);
  document.documentElement.classList.toggle("light", mode === "light");
}

/** IRC chatroom theme — synced via `<html class="light">`; default :root is dark. */
export function useIrcChatTheme() {
  const [theme, setTheme] = useState<IrcChatThemeMode>(() => readTheme());

  useEffect(() => {
    const sync = () => setTheme(readTheme());
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", sync);
    return () => {
      obs.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setThemeMode = useCallback((mode: IrcChatThemeMode) => {
    applyIrcChatTheme(mode);
    setTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(theme === "dark" ? "light" : "dark");
  }, [theme, setThemeMode]);

  return { theme, toggleTheme, setThemeMode };
}

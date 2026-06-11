import { useEffect, type ReactNode } from "react";
import i18n from "./index";
import { RTL_CODES, DEFAULT_LANG, LANG_STORAGE_KEY } from "./languages";

function applyDir(lng: string) {
  if (typeof document === "undefined") return;
  const dir = RTL_CODES.has(lng) ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyDir(i18n.language || DEFAULT_LANG);
    const onChange = (lng: string) => {
      applyDir(lng);
      try { localStorage.setItem(LANG_STORAGE_KEY, lng); } catch { /* noop */ }
    };
    i18n.on("languageChanged", onChange);
    return () => { i18n.off("languageChanged", onChange); };
  }, []);

  return <>{children}</>;
}

export function setLanguage(code: string) {
  return i18n.changeLanguage(code);
}

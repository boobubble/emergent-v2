import { useEffect, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { RTL_CODES, DEFAULT_LANG, LANG_STORAGE_KEY } from "./languages";
import { isGuestHomePath } from "@/lib/stored-auth";

function applyDir(lng: string) {
  if (typeof document === "undefined") return;
  const dir = RTL_CODES.has(lng) ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
}

async function loadI18n() {
  const mod = await import("./index");
  return mod.default;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (l) => l.pathname });

  useEffect(() => {
    if (pathname === "/" && isGuestHomePath()) {
      applyDir(DEFAULT_LANG);
      return;
    }
    let cancelled = false;
    let off: (() => void) | undefined;
    void loadI18n().then((i18n) => {
      if (cancelled) return;
      applyDir(i18n.language || DEFAULT_LANG);
      const onChange = (lng: string) => {
        applyDir(lng);
        try { localStorage.setItem(LANG_STORAGE_KEY, lng); } catch { /* noop */ }
      };
      i18n.on("languageChanged", onChange);
      off = () => { i18n.off("languageChanged", onChange); };
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, [pathname]);

  return <>{children}</>;
}

export function setLanguage(code: string) {
  return loadI18n().then((i18n) => i18n.changeLanguage(code));
}

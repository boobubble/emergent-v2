import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { DEFAULT_LANG, LANGUAGES, LANG_STORAGE_KEY } from "./languages";

const supported = LANGUAGES.map(l => l.code);

if (!i18n.isInitialized) {
  i18n
    .use(ChainedBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: DEFAULT_LANG,
      supportedLngs: supported,
      // Lazy-load: never fetch anything until a language is actually active.
      preload: false,
      partialBundledLanguages: false,
      load: "languageOnly",
      ns: ["common"],
      defaultNS: "common",
      // Two-tier cache: serve from localStorage instantly, refresh from network in background.
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          {
            // 7-day TTL; bump prefix to invalidate on deploy if you ship new strings.
            prefix: "i18n_res_",
            expirationTime: 7 * 24 * 60 * 60 * 1000,
            defaultVersion: "v1",
          },
          {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
            // Let the browser HTTP cache help too.
            requestOptions: { cache: "default" },
          },
        ],
      },
      detection: {
        order: ["querystring", "localStorage", "cookie", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: LANG_STORAGE_KEY,
        lookupQuerystring: "lang",
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      returnEmptyString: false,
      // Don't auto-fetch every fallback chain — only the active language is loaded.
      nonExplicitSupportedLngs: false,
    });
}

/** Optionally prefetch a language bundle (e.g. on hover before switching). */
export function prefetchLanguage(code: string) {
  if (!code || code === i18n.language) return Promise.resolve();
  return i18n.loadLanguages(code);
}

export default i18n;

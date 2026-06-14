import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { DEFAULT_LANG, LANGUAGES, LANG_STORAGE_KEY } from "./languages";

const supported = LANGUAGES.map(l => l.code);

// IMPORTANT: Cloudflare Workers forbid async I/O, setTimeout, or randomness in
// the global scope. i18next's init() schedules timers and (with HttpBackend)
// kicks off fetches synchronously, which crashes SSR with
// "Disallowed operation called within global scope". Only initialize in the
// browser; SSR renders use the default (untranslated) strings.
if (typeof window !== "undefined" && !i18n.isInitialized) {
  i18n
    .use(ChainedBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: DEFAULT_LANG,
      supportedLngs: supported,
      preload: false,
      partialBundledLanguages: false,
      load: "languageOnly",
      ns: ["common"],
      defaultNS: "common",
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          {
            prefix: "i18n_res_",
            expirationTime: 7 * 24 * 60 * 60 * 1000,
            defaultVersion: "v1",
          },
          {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
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
      nonExplicitSupportedLngs: false,
    });
}

/** Optionally prefetch a language bundle (e.g. on hover before switching). */
export function prefetchLanguage(code: string) {
  if (!code || code === i18n.language) return Promise.resolve();
  return i18n.loadLanguages(code);
}

export default i18n;

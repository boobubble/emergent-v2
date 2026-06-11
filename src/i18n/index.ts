import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { DEFAULT_LANG, LANGUAGES, LANG_STORAGE_KEY } from "./languages";

const supported = LANGUAGES.map(l => l.code);

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: DEFAULT_LANG,
      supportedLngs: supported,
      load: "languageOnly",
      ns: ["common"],
      defaultNS: "common",
      backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
      detection: {
        order: ["querystring", "localStorage", "cookie", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: LANG_STORAGE_KEY,
        lookupQuerystring: "lang",
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      returnEmptyString: false,
    });
}

export default i18n;

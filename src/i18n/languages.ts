export interface LanguageDef {
  code: string;
  name: string;        // English name
  nativeName: string;  // Native script
  flag: string;        // Emoji flag
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageDef[] = [
  { code: "en", name: "English",    nativeName: "English",    flag: "🇺🇸", dir: "ltr" },
  { code: "hi", name: "Hindi",      nativeName: "हिन्दी",     flag: "🇮🇳", dir: "ltr" },
  { code: "es", name: "Spanish",    nativeName: "Español",    flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "French",     nativeName: "Français",   flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "German",     nativeName: "Deutsch",    flag: "🇩🇪", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português",  flag: "🇧🇷", dir: "ltr" },
  { code: "ar", name: "Arabic",     nativeName: "العربية",    flag: "🇸🇦", dir: "rtl" },
];

export const RTL_CODES = new Set(LANGUAGES.filter(l => l.dir === "rtl").map(l => l.code));
export const DEFAULT_LANG = "en";
export const LANG_STORAGE_KEY = "app.lang";

export function getLanguage(code: string): LanguageDef {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0];
}
